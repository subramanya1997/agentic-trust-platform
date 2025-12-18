"""Organization management routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.workos_client import (
    create_organization as workos_create_org,
    list_organization_memberships,
)
from app.database import get_db
from app.dependencies import get_current_org, get_current_user, get_session
from app.models import Organization, OrganizationRead, User
from app.services.workos_service import WorkOSService

router = APIRouter()


class OrganizationCreateRequest(BaseModel):
    """Request to create a new organization."""

    name: str


class OrganizationUpdateRequest(BaseModel):
    """Request to update organization settings."""

    name: str | None = None
    logo_url: str | None = None
    billing_email: str | None = None
    settings: dict | None = None


@router.get("", response_model=list[OrganizationRead])
async def list_organizations(
    session=Depends(get_session),
    db: AsyncSession = Depends(get_db),
):
    """List organizations the current user is a member of."""
    memberships = list_organization_memberships(user_id=session.user.id)

    service = WorkOSService(db)
    orgs = []

    for m in memberships.data:
        org = await service.sync_organization(m.organization_id)
        orgs.append(org)

    return orgs


@router.post("", response_model=OrganizationRead, status_code=status.HTTP_201_CREATED)
async def create_organization(
    data: OrganizationCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new organization."""
    try:
        workos_org = workos_create_org(name=data.name)

        org = Organization(
            id=workos_org.id,
            name=workos_org.name,
            slug=Organization.generate_slug(workos_org.name),
        )
        db.add(org)
        await db.commit()
        await db.refresh(org)

        return org

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create organization: {e!s}",
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
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
):
    """Update the current organization's settings."""
    if data.name is not None:
        org.name = data.name
        org.slug = Organization.generate_slug(data.name)

    if data.logo_url is not None:
        org.logo_url = data.logo_url

    if data.billing_email is not None:
        org.billing_email = data.billing_email

    if data.settings is not None:
        org.settings = {**org.settings, **data.settings}

    await db.commit()
    await db.refresh(org)

    return org


@router.get("/{org_id}", response_model=OrganizationRead)
async def get_organization(
    org_id: str,
    session=Depends(get_session),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific organization by ID."""
    memberships = list_organization_memberships(
        user_id=session.user.id,
        organization_id=org_id,
    )

    if not memberships.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization",
        )

    org = await db.get(Organization, org_id)
    if not org:
        service = WorkOSService(db)
        org = await service.sync_organization(org_id)

    return org

