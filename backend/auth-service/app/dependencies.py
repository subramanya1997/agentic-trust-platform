"""FastAPI dependencies for authentication and authorization."""

from fastapi import Depends, HTTPException, Request, status
from shared.log_config import bind_user_context
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.membership import verify_org_membership
from app.core.session import SessionData, SessionUser
from app.core.workos_client import (
    load_sealed_session,
    refresh_sealed_session,
)
from app.database import get_db
from app.models import Organization, User
from app.services import WorkOSService, get_workos_service


async def get_session(request: Request) -> SessionData:
    """Extract and validate WorkOS session from cookie."""
    session_cookie = request.cookies.get(settings.session_cookie_name)

    if not session_cookie:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        auth_response = load_sealed_session(session_cookie)
        
        # Check if session is authenticated
        if not auth_response.authenticated:
            raise ValueError("Session is not authenticated")
        
        # Get organization ID from header (set by frontend) or from auth_response
        org_id = request.headers.get("X-Organization-ID") or auth_response.organization_id
        
        # Get user and role directly from auth_response
        user_data = auth_response.user
        role = auth_response.role
        
        # Extract user info
        return SessionData(
            user=SessionUser(
                id=user_data.id,
                email=user_data.email,
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                email_verified=user_data.email_verified,
                profile_picture_url=getattr(user_data, "profile_picture_url", None),
            ),
            organization_id=org_id,
            role=role,
        )
    except HTTPException:
        raise
    except Exception as e:
        # Add header to indicate session might be refreshable
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session. Please log in again." if not settings.debug else f"Invalid session: {e!s}",
            headers={
                "WWW-Authenticate": "Bearer",
                "X-Session-Expired": "true",
            },
        )


async def get_current_user(
    session: SessionData = Depends(get_session),
    db: AsyncSession = Depends(get_db),
    service: WorkOSService = Depends(get_workos_service),
) -> User:
    """Get current authenticated user from database."""
    user = await db.get(User, session.user.id)

    if not user:
        # First login - sync user from WorkOS session
        user = await service.sync_user_from_session(session.user)

    # Bind user ID to logging context for all subsequent logs
    bind_user_context(user.id)

    return user


async def get_optional_session(request: Request) -> SessionData | None:
    """Get session if present, None otherwise."""
    session_cookie = request.cookies.get(settings.session_cookie_name)
    if not session_cookie:
        return None

    try:
        return await get_session(request)
    except HTTPException:
        return None


async def get_current_org(
    session: SessionData = Depends(get_session),
    db: AsyncSession = Depends(get_db),
    service: WorkOSService = Depends(get_workos_service),
) -> Organization:
    """Get current organization from session."""
    if not session.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No organization selected. Set X-Organization-ID header.",
        )

    # Verify membership via WorkOS
    verify_org_membership(session.user.id, session.organization_id)

    # Get or sync organization
    org = await db.get(Organization, session.organization_id)
    if not org:
        org = await service.sync_organization(session.organization_id)

    return org


async def get_current_role(
    session: SessionData = Depends(get_session),
) -> str:
    """Get user's role in current organization."""
    return session.role or "member"

