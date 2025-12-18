"""Authentication routes using WorkOS."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.workos_client import (
    authenticate_with_code,
    get_authorization_url,
    list_organization_memberships,
)
from app.database import get_db
from app.dependencies import get_current_user, get_session
from app.models import User, UserRead
from app.services.workos_service import WorkOSService

router = APIRouter()


class AuthURLResponse(BaseModel):
    """Response with authorization URL."""

    authorization_url: str


class AuthCallbackResponse(BaseModel):
    """Response from auth callback."""

    success: bool
    user_id: str


class OrganizationMembership(BaseModel):
    """Organization membership info."""

    id: str
    organization_id: str
    organization_name: str
    role: str


@router.get("/login-url", response_model=AuthURLResponse)
async def get_login_url(
    redirect_uri: str | None = None,
    state: str | None = None,
):
    """Get WorkOS authorization URL for login."""
    url = get_authorization_url(
        redirect_uri=redirect_uri,
        state=state,
    )
    return AuthURLResponse(authorization_url=url)


@router.get("/callback")
async def auth_callback(
    code: str,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Handle WorkOS OAuth callback."""
    try:
        auth_result = authenticate_with_code(code)

        service = WorkOSService(db)
        user = await service.sync_user(auth_result["user"])

        client_ip = request.client.host if request.client else None
        await service.update_user_login(user, client_ip)

        response.set_cookie(
            key="wos-session",
            value=auth_result["sealed_session"],
            httponly=True,
            secure=not settings.debug,
            samesite="lax",
            max_age=60 * 60 * 24 * 7,
            path="/",
        )

        return AuthCallbackResponse(
            success=True,
            user_id=user.id,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication failed: {e!s}",
        )


@router.post("/logout")
async def logout(response: Response):
    """Log out user by clearing session cookie."""
    response.delete_cookie(
        key="wos-session",
        path="/",
    )
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me", response_model=UserRead)
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return user


@router.get("/organizations", response_model=list[OrganizationMembership])
async def get_my_organizations(
    session=Depends(get_session),
    db: AsyncSession = Depends(get_db),
):
    """Get organizations the current user is a member of."""
    memberships = list_organization_memberships(user_id=session.user.id)

    result = []
    service = WorkOSService(db)

    for m in memberships.data:
        org = await service.sync_organization(m.organization_id)

        role = "member"
        if hasattr(m, "role") and m.role:
            role = m.role.value if hasattr(m.role, "value") else str(m.role)

        result.append(
            OrganizationMembership(
                id=m.id,
                organization_id=m.organization_id,
                organization_name=org.name,
                role=role,
            )
        )

    return result


@router.get("/session")
async def get_session_info(session=Depends(get_session)):
    """Get current session information."""
    return {
        "user_id": session.user.id,
        "email": session.user.email,
        "organization_id": session.organization_id,
        "role": session.role,
    }

