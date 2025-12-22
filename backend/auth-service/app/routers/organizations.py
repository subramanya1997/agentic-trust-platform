"""Organization management routes.

This module provides endpoints for managing organizations (workspaces).
It handles organization CRUD operations, membership verification, and
organization context management.

Endpoints:
    - GET /organizations: List user's organizations
    - POST /organizations: Create new organization
    - GET /organizations/current: Get current organization
    - PATCH /organizations/current: Update current organization
    - GET /organizations/{org_id}: Get specific organization

Key Features:
    - Multi-tenant organization support
    - Automatic organization syncing from WorkOS
    - Membership verification before access
    - Organization context via X-Organization-ID header
    - Batch organization fetching for performance

Organization Context:
    - Organizations are selected via X-Organization-ID header
    - Frontend sets this header when user switches organizations
    - All organization-scoped endpoints require this header
    - Current organization is cached in session

Usage:
    These endpoints are used by the frontend to:
    - Display user's organizations
    - Create new organizations
    - Switch between organizations
    - Update organization settings
"""

import logging
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, status
from sqlalchemy.exc import SQLAlchemyError

from shared.exceptions import DatabaseError, ValidationError, WorkOSError
from app.core.membership import verify_org_membership
from app.core.workos_client import list_organization_memberships
from app.dependencies import get_current_org, get_current_user, get_session
from app.models import Organization, OrganizationRead, User
from app.schemas.organization import (
    OrganizationCreateRequest,
    OrganizationUpdateRequest,
)
from app.services import WorkOSService, get_workos_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=list[OrganizationRead])
async def list_organizations(
    service: Annotated[WorkOSService, Depends(get_workos_service)],
    session=Depends(get_session),
):
    """
    List organizations the current user is a member of.
    
    This endpoint returns all organizations the authenticated user belongs to.
    Organizations are synced from WorkOS to the local database for faster
    access. Missing organizations are automatically synced.
    
    Process:
        1. Fetch organization memberships from WorkOS
        2. Sync each organization to local database (if needed)
        3. Return list of organization models
    
    Authentication:
        Required (session cookie)
    
    Returns:
        list[OrganizationRead]: List of organizations with:
            - id: Organization ID (WorkOS format)
            - name: Organization name
            - slug: URL-safe slug
            - logo_url: Organization logo URL
            - billing_email: Billing email
            - plan: Subscription plan
            - is_personal_workspace: Whether this is a personal workspace
            - created_at: Organization creation timestamp
            
    Example:
        >>> GET /organizations
        [
            {
                "id": "org_01ABC123",
                "name": "Acme Corp",
                "slug": "acme-corp",
                "logo_url": "https://...",
                "billing_email": "billing@acme.com",
                "plan": "pro",
                "is_personal_workspace": false,
                "created_at": "2024-01-01T00:00:00Z"
            }
        ]
    
    Error Handling:
        - 503: WorkOS API unavailable
        - 500: Database error during sync
    
    Note:
        Organizations are synced on-demand. First request may be slower
        if organizations need to be synced from WorkOS.
    """
    try:
        memberships = list_organization_memberships(user_id=session.user.id)
    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        logger.error("WorkOS API error listing organization memberships", exc_info=True)
        raise WorkOSError(
            "Failed to fetch organization memberships",
            details={"user_id": session.user.id} if hasattr(session, "user") else None,
        )

    orgs = []

    for m in memberships.data:
        try:
            org = await service.sync_organization(m.organization_id)
            orgs.append(org)
        except SQLAlchemyError as e:
            logger.error(f"Database error syncing organization {m.organization_id}", exc_info=True)
            raise DatabaseError(
                "Failed to sync organization data",
                details={"organization_id": m.organization_id},
            )

    return orgs


@router.post("", response_model=OrganizationRead, status_code=status.HTTP_201_CREATED)
async def create_organization(
    data: OrganizationCreateRequest,
    service: Annotated[WorkOSService, Depends(get_workos_service)],
    user: User = Depends(get_current_user),
):
    """
    Create a new organization.
    
    This endpoint creates a new organization in WorkOS and syncs it to the
    local database. The creating user is automatically added as an admin
    member of the organization.
    
    Process:
        1. Create organization in WorkOS
        2. Sync organization to local database
        3. User is automatically added as admin (via WorkOS)
        4. Return created organization
    
    Authentication:
        Required (session cookie)
    
    Request Body:
        {
            "name": "My Organization"  # Required, validated and sanitized
        }
        
    Returns:
        OrganizationRead: Created organization with:
            - id: Organization ID (WorkOS format)
            - name: Organization name
            - slug: Auto-generated URL-safe slug
            - All other organization fields
            
    Example:
        >>> POST /organizations
        {
            "name": "Acme Corporation"
        }
        
        Response:
        {
            "id": "org_01ABC123",
            "name": "Acme Corporation",
            "slug": "acme-corporation",
            ...
        }
    
    Error Handling:
        - 400: Invalid organization name (validation error)
        - 503: WorkOS API unavailable
        - 500: Database error during sync
    
    Note:
        The creating user is automatically added as an admin member by WorkOS.
        Organization slug is auto-generated from the name.
    """
    try:
        org = await service.create_organization_with_sync(name=data.name)
        return org
    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        logger.error("WorkOS API error creating organization", exc_info=True)
        raise WorkOSError(
            "Failed to create organization in WorkOS",
            details={"name": data.name},
        )
    except SQLAlchemyError as e:
        logger.error("Database error creating organization", exc_info=True)
        raise DatabaseError(
            "Failed to save organization to database",
            details={"name": data.name},
        )
    except ValueError as e:
        logger.error(f"Validation error creating organization: {e}", exc_info=True)
        raise ValidationError(
            f"Invalid organization data: {e!s}",
            details={"name": data.name},
        )


@router.get("/current", response_model=OrganizationRead)
async def get_current_organization(
    org: Organization = Depends(get_current_org),
):
    """
    Get the currently selected organization.
    
    This endpoint returns the organization specified in the X-Organization-ID
    header. The user's membership is verified before returning the organization.
    
    Authentication:
        Required (session cookie)
    
    Authorization:
        User must be a member of the organization
        
    Headers:
        X-Organization-ID: Current organization ID (required)
        
    Returns:
        OrganizationRead: Current organization details
        
    Example:
        >>> GET /organizations/current
        Headers: X-Organization-ID: org_01ABC123
        
        Response:
        {
            "id": "org_01ABC123",
            "name": "Acme Corp",
            ...
        }
    
    Error Handling:
        - 403: User is not a member of the organization
        - 400: No organization selected (missing header)
    """
    return org


@router.patch("/current", response_model=OrganizationRead)
async def update_current_organization(
    data: OrganizationUpdateRequest,
    service: Annotated[WorkOSService, Depends(get_workos_service)],
    org: Organization = Depends(get_current_org),
):
    """
    Update the current organization's settings.
    
    This endpoint updates the organization specified in the X-Organization-ID
    header. Only provided fields are updated (partial update). Settings are
    merged with existing settings, not replaced.
    
    Authentication:
        Required (session cookie)
    
    Authorization:
        User must be a member of the organization (admin recommended for updates)
        
    Headers:
        X-Organization-ID: Current organization ID (required)
        
    Request Body:
        All fields optional:
        {
            "name": "Updated Name",
            "logo_url": "https://example.com/logo.png",
            "billing_email": "billing@example.com",
            "settings": {
                "theme": "dark"
            }
        }
        
    Returns:
        OrganizationRead: Updated organization
        
    Example:
        >>> PATCH /organizations/current
        Headers: X-Organization-ID: org_01ABC123
        Body: {
            "name": "New Name",
            "settings": {"theme": "dark"}
        }
    
    Error Handling:
        - 400: Invalid data (validation error)
        - 403: User is not a member
        - 503: WorkOS API error
        - 500: Database error
    
    Note:
        Settings are merged with existing settings. To replace settings entirely,
        send the complete settings object.
    """
    try:
        org = await service.update_organization(
            org=org,
            name=data.name,
            logo_url=data.logo_url,
            billing_email=data.billing_email,
            settings=data.settings,
        )
        return org
    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        logger.error("WorkOS API error updating organization", exc_info=True)
        raise WorkOSError(
            "Failed to update organization in WorkOS",
            details={"organization_id": org.id},
        )
    except SQLAlchemyError as e:
        logger.error("Database error updating organization", exc_info=True)
        raise DatabaseError(
            "Failed to save organization updates to database",
            details={"organization_id": org.id},
        )
    except ValueError as e:
        logger.error(f"Validation error updating organization: {e}", exc_info=True)
        raise ValidationError(
            f"Invalid organization data: {e!s}",
            details={"organization_id": org.id},
        )


@router.get("/{org_id}", response_model=OrganizationRead)
async def get_organization(
    org_id: str,
    service: Annotated[WorkOSService, Depends(get_workos_service)],
    session=Depends(get_session),
):
    """
    Get a specific organization by ID.
    
    This endpoint returns a specific organization by its ID. The user's
    membership is verified via WorkOS before returning the organization.
    The organization is synced from WorkOS if it doesn't exist locally.
    
    Authentication:
        Required (session cookie)
    
    Authorization:
        User must be a member of the organization
        
    Path Parameters:
        org_id: Organization ID (WorkOS format: org_xxxxx)
        
    Returns:
        OrganizationRead: Organization details
        
    Example:
        >>> GET /organizations/org_01ABC123
        
        Response:
        {
            "id": "org_01ABC123",
            "name": "Acme Corp",
            ...
        }
    
    Error Handling:
        - 403: User is not a member of the organization
        - 404: Organization not found (after syncing from WorkOS)
        - 500: Database error
    
    Note:
        Membership verification uses WorkOS API to ensure user has access.
        Organization is synced from WorkOS if not found locally.
    """
    # Verify user is a member of the organization (raises AuthorizationError if not)
    verify_org_membership(session.user.id, org_id)

    try:
        org = await service.get_organization_by_id(org_id)
        return org
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching organization {org_id}", exc_info=True)
        raise DatabaseError(
            "Failed to fetch organization from database",
            details={"organization_id": org_id},
        )

