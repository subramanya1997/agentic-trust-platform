"""FastAPI dependencies for authentication and authorization.

This module provides FastAPI dependency functions for authentication, authorization,
and accessing current user/organization context. These dependencies are used
throughout route handlers to ensure proper authentication and authorization.

Key Dependencies:
- get_session: Extract and validate WorkOS session from cookie
- get_current_user: Get current authenticated user from database
- get_current_org: Get current organization with membership verification
- get_current_role: Get user's role in current organization
- get_optional_session: Get session if present (for optional auth routes)

Authentication Flow:
1. Request arrives with session cookie
2. get_session validates cookie with WorkOS
3. Extracts user and organization context
4. get_current_user syncs user to database if needed
5. get_current_org verifies membership and syncs org if needed

Usage:
    from app.dependencies import get_current_user, get_current_org
    from app.models import User, Organization
    
    @router.get("/protected")
    async def protected_route(
        user: User = Depends(get_current_user),
        org: Organization = Depends(get_current_org)
    ):
        # User and org are guaranteed to be authenticated and valid
        return {"user_id": user.id, "org_id": org.id}
"""

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
    """
    Extract and validate WorkOS session from cookie.
    
    This is the core authentication dependency that validates the WorkOS sealed
    session cookie and extracts user and organization context. It's used by
    all other authentication dependencies.
    
    Process:
    1. Extracts session cookie from request
    2. Validates cookie with WorkOS API
    3. Extracts user information and role
    4. Gets organization ID from header or session
    5. Returns SessionData with all context
    
    Session Cookie:
        - Name: "wos-session" (configurable via settings)
        - Format: WorkOS sealed session token (encrypted)
        - HTTP-only: Yes (prevents XSS attacks)
        - Secure: Yes in production (HTTPS only)
        - SameSite: Lax (CSRF protection)
    
    Organization Context:
        - Primary: X-Organization-ID header (set by frontend)
        - Fallback: organization_id from WorkOS session
        - Required: User must be a member of the organization
    
    Args:
        request: FastAPI request object
        
    Returns:
        SessionData: Parsed session data with user and organization context
        
    Raises:
        HTTPException: 401 Unauthorized if:
            - No session cookie present
            - Session is invalid or expired
            - Session validation fails
            
    Example:
        @router.get("/protected")
        async def protected_route(session: SessionData = Depends(get_session)):
            user_id = session.user.id
            org_id = session.organization_id
            role = session.role
            ...
    
    Note:
        This dependency does NOT sync user/org to database. Use get_current_user
        or get_current_org for that functionality.
    """
    session_cookie = request.cookies.get(settings.session_cookie_name)

    if not session_cookie:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Validate sealed session with WorkOS
        auth_response = load_sealed_session(session_cookie)
        
        # Check if session is authenticated
        if not auth_response.authenticated:
            raise ValueError("Session is not authenticated")
        
        # Get organization ID from header (set by frontend) or from auth_response
        # Frontend sets X-Organization-ID header to switch between user's organizations
        org_id = request.headers.get("X-Organization-ID") or auth_response.organization_id
        
        # Get user and role directly from auth_response
        user_data = auth_response.user
        role = auth_response.role
        
        # Extract user info into SessionUser model
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
        # Re-raise HTTP exceptions (already properly formatted)
        raise
    except Exception as e:
        # Add header to indicate session might be refreshable
        # Frontend can use this to attempt session refresh
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
    """
    Get current authenticated user from database.
    
    This dependency ensures the user exists in the local database and syncs
    from WorkOS if this is their first login. It also binds the user ID to
    the logging context for request correlation.
    
    Process:
    1. Gets user ID from validated session
    2. Looks up user in local database
    3. If not found, syncs user from WorkOS (first login)
    4. Binds user ID to logging context
    5. Returns User model
    
    First Login Handling:
        - If user doesn't exist in database, syncs from WorkOS
        - Creates User record with data from WorkOS session
        - Subsequent requests will use cached database record
    
    Logging Context:
        - Binds user_id to structured logging context
        - All subsequent logs in the request will include user_id
        - Enables filtering logs by user for debugging
    
    Args:
        session: Validated session data (from get_session dependency)
        db: Database session (from get_db dependency)
        service: WorkOS service for syncing users
        
    Returns:
        User: User model from database
        
    Raises:
        HTTPException: 401 Unauthorized if session is invalid (from get_session)
        
    Example:
        @router.get("/users/me")
        async def get_me(user: User = Depends(get_current_user)):
            return user
    
    Note:
        This dependency depends on get_session, so session validation happens first.
        User is guaranteed to be authenticated and exist in database.
    """
    user = await db.get(User, session.user.id)

    if not user:
        # First login - sync user from WorkOS session
        # This happens automatically on first authentication
        user = await service.sync_user_from_session(session.user)

    # Bind user ID to logging context for all subsequent logs
    # This enables filtering logs by user_id for debugging and audit
    bind_user_context(user.id)

    return user


async def get_optional_session(request: Request) -> SessionData | None:
    """
    Get session if present, None otherwise.
    
    This dependency is used for routes that work with or without authentication.
    It returns None if no session cookie is present, allowing the route handler
    to provide different behavior for authenticated vs unauthenticated users.
    
    Use Cases:
        - Public routes that show different content for logged-in users
        - Optional authentication for enhanced features
        - Graceful degradation when auth is unavailable
    
    Args:
        request: FastAPI request object
        
    Returns:
        SessionData | None: Session data if authenticated, None otherwise
        
    Example:
        @router.get("/public")
        async def public_route(session: SessionData | None = Depends(get_optional_session)):
            if session:
                # Show personalized content
                return {"message": f"Hello {session.user.email}"}
            else:
                # Show generic content
                return {"message": "Hello guest"}
    
    Note:
        This does NOT raise exceptions for missing sessions. Use get_session
        if authentication is required.
    """
    session_cookie = request.cookies.get(settings.session_cookie_name)
    if not session_cookie:
        return None

    try:
        return await get_session(request)
    except HTTPException:
        # Return None instead of raising exception
        return None


async def get_current_org(
    session: SessionData = Depends(get_session),
    db: AsyncSession = Depends(get_db),
    service: WorkOSService = Depends(get_workos_service),
) -> Organization:
    """
    Get current organization from session with membership verification.
    
    This dependency ensures the user is a member of the organization and
    syncs the organization from WorkOS if it doesn't exist locally.
    
    Process:
    1. Checks if organization_id is set in session
    2. Verifies user membership via WorkOS API
    3. Looks up organization in local database
    4. Syncs from WorkOS if not found locally
    5. Returns Organization model
    
    Membership Verification:
        - Uses WorkOS API to verify user is a member
        - Raises 403 Forbidden if user is not a member
        - Prevents unauthorized access to organization data
    
    Organization Syncing:
        - If organization doesn't exist locally, syncs from WorkOS
        - Creates Organization record with data from WorkOS
        - Subsequent requests use cached database record
    
    Args:
        session: Validated session data (from get_session dependency)
        db: Database session (from get_db dependency)
        service: WorkOS service for syncing organizations
        
    Returns:
        Organization: Organization model from database
        
    Raises:
        HTTPException: 
            - 401 Unauthorized if session is invalid (from get_session)
            - 403 Forbidden if:
                - No organization selected (missing X-Organization-ID header)
                - User is not a member of the organization
        
    Example:
        @router.get("/organizations/current")
        async def get_current_org_endpoint(
            org: Organization = Depends(get_current_org)
        ):
            return org
    
    Note:
        Organization ID comes from X-Organization-ID header (set by frontend)
        or from the WorkOS session. Frontend must set this header when
        switching between organizations.
    """
    if not session.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No organization selected. Set X-Organization-ID header.",
        )

    # Verify membership via WorkOS
    # This ensures user is actually a member before allowing access
    verify_org_membership(session.user.id, session.organization_id)

    # Get or sync organization
    org = await db.get(Organization, session.organization_id)
    if not org:
        # Organization doesn't exist locally, sync from WorkOS
        org = await service.sync_organization(session.organization_id)

    return org


async def get_current_role(
    session: SessionData = Depends(get_session),
) -> str:
    """
    Get user's role in current organization.
    
    This dependency extracts the role from the validated session. It's used
    for role-based access control checks in route handlers.
    
    Args:
        session: Validated session data (from get_session dependency)
        
    Returns:
        str: User's role ("admin", "member", "viewer") or "member" as default
        
    Example:
        @router.post("/agents")
        async def create_agent(
            role: str = Depends(get_current_role),
            session: SessionData = Depends(get_session)
        ):
            if role != "admin" and role != "member":
                raise HTTPException(403, "Insufficient permissions")
            # Create agent...
    
    Note:
        Role comes from WorkOS session and represents the user's role in
        the current organization (from X-Organization-ID header).
    """
    return session.role or "member"

