"""FastAPI dependencies for authentication and authorization."""

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.session import SessionData, SessionUser
from app.core.workos_client import list_organization_memberships, load_sealed_session
from app.database import get_db
from app.models import Organization, User
from app.services.workos_service import WorkOSService


async def get_session(request: Request) -> SessionData:
    """Extract and validate WorkOS session from cookie."""
    session_cookie = request.cookies.get("wos-session")

    if not session_cookie:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        session = load_sealed_session(session_cookie)

        # Get organization ID from header (set by frontend)
        org_id = request.headers.get("X-Organization-ID")

        # Get role from session if available
        role = None
        if hasattr(session, "organization_membership") and session.organization_membership:
            role = (
                session.organization_membership.role.value
                if session.organization_membership.role
                else None
            )

        return SessionData(
            user=SessionUser(
                id=session.user.id,
                email=session.user.email,
                first_name=session.user.first_name,
                last_name=session.user.last_name,
                email_verified=session.user.email_verified,
                profile_picture_url=getattr(session.user, "profile_picture_url", None),
            ),
            organization_id=org_id,
            role=role,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid session: {e!s}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    session: SessionData = Depends(get_session),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user from database."""
    user = await db.get(User, session.user.id)

    if not user:
        # First login - sync user from WorkOS session
        service = WorkOSService(db)
        user = await service.sync_user_from_session(session.user)

    return user


async def get_optional_session(request: Request) -> SessionData | None:
    """Get session if present, None otherwise."""
    session_cookie = request.cookies.get("wos-session")
    if not session_cookie:
        return None

    try:
        return await get_session(request)
    except HTTPException:
        return None


async def get_current_org(
    session: SessionData = Depends(get_session),
    db: AsyncSession = Depends(get_db),
) -> Organization:
    """Get current organization from session."""
    if not session.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No organization selected. Set X-Organization-ID header.",
        )

    # Verify membership via WorkOS
    memberships = list_organization_memberships(
        user_id=session.user.id,
        organization_id=session.organization_id,
    )

    if not memberships.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization",
        )

    # Get or sync organization
    org = await db.get(Organization, session.organization_id)
    if not org:
        service = WorkOSService(db)
        org = await service.sync_organization(session.organization_id)

    return org


async def get_current_role(
    session: SessionData = Depends(get_session),
) -> str:
    """Get user's role in current organization."""
    return session.role or "member"

