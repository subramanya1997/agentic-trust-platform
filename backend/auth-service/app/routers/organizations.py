"""Organization management routes."""

import logging
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, status
from sqlalchemy.exc import SQLAlchemyError

from app.core.exceptions import DatabaseError, ValidationError, WorkOSError
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
    """List organizations the current user is a member of."""
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
    """Create a new organization."""
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
    """Get the currently selected organization."""
    return org


@router.patch("/current", response_model=OrganizationRead)
async def update_current_organization(
    data: OrganizationUpdateRequest,
    service: Annotated[WorkOSService, Depends(get_workos_service)],
    org: Organization = Depends(get_current_org),
):
    """Update the current organization's settings."""
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
    """Get a specific organization by ID."""
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

