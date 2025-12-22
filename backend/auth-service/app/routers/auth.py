"""Authentication routes using WorkOS.

This module provides authentication endpoints for OAuth-based login via WorkOS.
It handles the complete OAuth flow including authorization URL generation,
callback processing, session management, and user information retrieval.

Endpoints:
    - GET /auth/login-url: Get OAuth authorization URL
    - GET /auth/callback: Handle OAuth callback
    - POST /auth/logout: Log out user
    - POST /auth/refresh: Refresh session token
    - GET /auth/me: Get current user information
    - GET /auth/organizations: List user's organizations
    - GET /auth/session: Get current session information

Key Features:
    - OAuth 2.0 flow with WorkOS
    - CSRF protection via state tokens
    - HTTP-only cookie session management
    - Session refresh without re-authentication
    - Automatic user/organization syncing
    - Rate limiting on sensitive endpoints

Security:
    - CSRF protection: State tokens stored in secure cookies
    - HTTP-only cookies: Prevents XSS attacks
    - Rate limiting: Prevents brute force attacks
    - Secure cookies in production: HTTPS-only cookies

OAuth Flow:
    1. Client requests login URL
    2. Server generates CSRF state token
    3. User redirects to WorkOS for authentication
    4. WorkOS redirects back with authorization code
    5. Server validates CSRF state and exchanges code for session
    6. Server sets HTTP-only session cookie
    7. Client uses session cookie for authenticated requests

Usage:
    These endpoints are used by the frontend for:
    - Initiating OAuth login
    - Handling OAuth callbacks
    - Managing user sessions
    - Retrieving user and organization information
"""

import hashlib
import logging
import secrets
from typing import Annotated

import httpx
from circuitbreaker import CircuitBreakerError
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from shared.exceptions import DatabaseError, WorkOSError
from app.core.roles import normalize_role
from app.core.workos_client import (
    authenticate_with_code,
    get_authorization_url,
    list_organization_memberships,
    refresh_sealed_session,
)
from app.dependencies import get_current_user, get_session
from app.models import User, UserRead
from app.schemas.auth import (
    AuthCallbackResponse,
    AuthURLResponse,
    OrganizationMembershipResponse,
)
from app.services import WorkOSService, get_workos_service

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize limiter for rate limiting
limiter = Limiter(key_func=get_remote_address)


@router.get("/login-url", response_model=AuthURLResponse)
@limiter.limit("10/minute")
async def get_login_url(
    request: Request,
    response: Response,
    redirect_uri: str | None = None,
    provider: str = "authkit",
):
    """
    Get WorkOS authorization URL for OAuth login.
    
    This endpoint initiates the OAuth flow by generating an authorization URL
    that the frontend should redirect the user to. It implements CSRF protection
    by generating a cryptographically random state token and storing its hash
    in a secure HTTP-only cookie.
    
    CSRF Protection Flow:
        1. Generate random 32-byte state token (URL-safe)
        2. Hash state token with SHA-256
        3. Store hash in secure HTTP-only cookie
        4. Include original state token in authorization URL
        5. Validate state token matches cookie hash on callback
    
    Authentication:
        Not required (public endpoint)
    
    Rate Limiting:
        10 requests per minute per IP address
        
    Query Parameters:
        redirect_uri (optional): Custom redirect URI after authentication
            - Defaults to WORKOS_REDIRECT_URI from settings
        provider (optional): OAuth provider name
            - "authkit": WorkOS AuthKit (default, supports multiple providers)
            - "GoogleOAuth": Google OAuth
            - "GitHubOAuth": GitHub OAuth
            - "MicrosoftOAuth": Microsoft OAuth
            - Custom providers configured in WorkOS
    
    Returns:
        AuthURLResponse: Contains authorization_url to redirect user to
        
    Example:
        >>> GET /auth/login-url?provider=GoogleOAuth
        {
            "authorization_url": "https://api.workos.com/authorize?client_id=...&state=..."
        }
    
    Security:
        - State token is cryptographically random (32 bytes)
        - State hash stored in HTTP-only cookie (prevents XSS)
        - Cookie is secure in production (HTTPS only)
        - Cookie expires after 10 minutes
    """
    # Generate CSRF state token
    csrf_state = secrets.token_urlsafe(32)
    
    # Store hashed state in secure cookie
    state_hash = hashlib.sha256(csrf_state.encode()).hexdigest()
    response.set_cookie(
        key=settings.oauth_state_cookie_name,
        value=state_hash,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite="lax",
        max_age=settings.oauth_state_max_age,
        path="/",
    )
    
    # Generate authorization URL with CSRF state
    url = get_authorization_url(
        redirect_uri=redirect_uri,
        state=csrf_state,
        provider=provider,
    )
    return AuthURLResponse(authorization_url=url)


@router.get("/callback")
@limiter.limit("20/minute")
async def auth_callback(
    request: Request,
    response: Response,
    code: str,
    service: Annotated[WorkOSService, Depends(get_workos_service)],
    state: str | None = None,
):
    """
    Handle WorkOS OAuth callback.
    
    This endpoint processes the OAuth callback from WorkOS after user
    authentication. It validates the CSRF state token, exchanges the
    authorization code for a session, syncs user data, and sets an
    HTTP-only session cookie.
    
    OAuth Callback Flow:
        1. WorkOS redirects user to this endpoint with code and state
        2. Validate CSRF state token matches cookie hash
        3. Exchange authorization code for WorkOS session
        4. Sync user to local database (create if first login)
        5. Update user login tracking (timestamp, IP)
        6. Ensure user has at least one organization
        7. Set HTTP-only session cookie
        8. Return success response
    
    Authentication:
        Not required (public endpoint, but requires valid OAuth code)
    
    Rate Limiting:
        20 requests per minute per IP address
        
    Query Parameters:
        code (required): Authorization code from WorkOS (single-use, expires quickly)
        state (required): CSRF state token from authorization URL
    
    Returns:
        AuthCallbackResponse: Success status and user ID
        
    Example:
        >>> GET /auth/callback?code=abc123&state=xyz789
        {
            "success": true,
            "user_id": "user_01ABC123"
        }
    
    Error Handling:
        - 403: Invalid CSRF state (security violation)
        - 400: Invalid authorization code or validation error
        - 503: WorkOS API unavailable (circuit breaker open)
        - 500: Database error during user sync
    
    Security:
        - Validates CSRF state token prevents CSRF attacks
        - Clears state cookie after validation
        - Sets secure HTTP-only session cookie
        - Handles both browser redirects and API responses
    """
    # Validate CSRF state
    stored_state_hash = request.cookies.get(settings.oauth_state_cookie_name)
    
    if not state or not stored_state_hash:
        logger.warning("OAuth callback missing CSRF state", extra={"has_state": bool(state), "has_cookie": bool(stored_state_hash)})
        
        # Handle missing state (browser vs API response)
        if request.headers.get("Accept", "").startswith("application/json"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid OAuth state. CSRF validation failed.",
            )
        return RedirectResponse(f"{settings.frontend_url}/auth/sign-in?error=invalid_state")
    
    # Validate state matches stored hash
    expected_hash = hashlib.sha256(state.encode()).hexdigest()
    if not secrets.compare_digest(stored_state_hash, expected_hash):
        logger.warning("OAuth callback CSRF state mismatch")
        
        # Handle invalid state (browser vs API response)
        if request.headers.get("Accept", "").startswith("application/json"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid OAuth state. CSRF validation failed.",
            )
        return RedirectResponse(f"{settings.frontend_url}/auth/sign-in?error=invalid_state")
    
    # Clear the state cookie after validation
    response.delete_cookie(
        key=settings.oauth_state_cookie_name,
        path="/",
    )
    
    try:
        logger.info("Processing authentication callback")
        auth_result = authenticate_with_code(code)

        user = await service.sync_user(auth_result["user"])

        client_ip = request.client.host if request.client else None
        await service.update_user_login(user, client_ip)
        
        # Ensure user has at least one organization (create personal workspace if needed)
        await service.ensure_user_has_organization(user)
        
        logger.info(f"User authenticated successfully: {user.email} (ID: {user.id})")

        response.set_cookie(
            key=settings.session_cookie_name,
            value=auth_result["sealed_session"],
            httponly=True,
            secure=settings.session_cookie_secure,
            samesite=settings.session_cookie_samesite,
            max_age=settings.session_cookie_max_age,
            path=settings.session_cookie_path,
        )

        return AuthCallbackResponse(
            success=True,
            user_id=user.id,
        )

    except CircuitBreakerError:
        logger.warning("Circuit breaker open - authentication service unavailable")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily unavailable due to high failure rate. Please try again in 30 seconds.",
            headers={"Retry-After": "30"},
        )
    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        logger.error("WorkOS API error during authentication", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily unavailable. Please try again later.",
        )
    except (SQLAlchemyError, DatabaseError) as e:
        logger.error("Database error during authentication", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save user data. Please try again.",
        )
    except ValueError as e:
        logger.error(f"Invalid authentication data: {e!s}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authentication failed. Please try again." if not settings.debug else f"Authentication failed: {e!s}",
        )


@router.post("/logout")
async def logout(response: Response):
    """
    Log out user by clearing session cookie.
    
    This endpoint logs out the current user by deleting the session cookie.
    After logout, the user will need to authenticate again to access
    protected endpoints.
    
    Authentication:
        Not strictly required (gracefully handles missing session)
    
    Returns:
        dict: Success message
        
    Example:
        >>> POST /auth/logout
        {
            "success": true,
            "message": "Logged out successfully"
        }
    
    Note:
        This endpoint always succeeds, even if no session cookie exists.
        This prevents errors when users try to log out multiple times.
    """
    logger.info("User logged out")
    response.delete_cookie(
        key=settings.session_cookie_name,
        path=settings.session_cookie_path,
    )
    return {"success": True, "message": "Logged out successfully"}


@router.post("/refresh")
@limiter.limit("10/minute")
async def refresh_session(request: Request, response: Response):
    """
    Refresh the session cookie to extend the session.
    
    This endpoint extends the user's session without requiring re-authentication.
    It uses the refresh token embedded in the sealed session to obtain a new
    access token and sealed session cookie.
    
    Session Refresh Process:
        1. Extract sealed session from cookie
        2. Use refresh token to get new access token from WorkOS
        3. Generate new sealed session with updated tokens
        4. Update session cookie with new sealed session
        5. Extend session expiration
    
    When to Use:
        - Before session expires (proactive refresh)
        - When access token expires (reactive refresh)
        - On session validation failure (retry mechanism)
    
    Authentication:
        Required (session cookie)
    
    Rate Limiting:
        10 requests per minute per IP address
        
    Returns:
        dict: Success message if refresh succeeded
        
    Example:
        >>> POST /auth/refresh
        {
            "success": true,
            "message": "Session refreshed successfully"
        }
    
    Error Handling:
        - 401: No session cookie or session expired
        - 503: WorkOS API unavailable (circuit breaker open)
    
    Note:
        Refresh tokens have longer expiration than access tokens (typically
        30 days). If refresh token expires, user must re-authenticate.
    """
    session_cookie = request.cookies.get("wos-session")
    
    if not session_cookie:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No session cookie found",
        )
    
    try:
        result = refresh_sealed_session(session_cookie)
        
        if result["authenticated"]:
            # Set the new session cookie
            response.set_cookie(
                key=settings.session_cookie_name,
                value=result["sealed_session"],
                httponly=True,
                secure=settings.session_cookie_secure,
                samesite=settings.session_cookie_samesite,
                max_age=settings.session_cookie_max_age,
                path=settings.session_cookie_path,
            )
            
            logger.info(f"Session refreshed for user: {result['user'].email}")
            return {
                "success": True,
                "message": "Session refreshed successfully",
            }
        
        # Session could not be refreshed
        logger.warning(f"Session refresh failed: {result.get('reason', 'unknown')}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again." if not settings.debug else f"Session refresh failed: {result.get('reason', 'Session expired')}",
        )
    
    except HTTPException:
        raise
    except CircuitBreakerError:
        logger.warning("Circuit breaker open - session refresh unavailable")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily unavailable due to high failure rate. Please try again in 30 seconds.",
            headers={"Retry-After": "30"},
        )
    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        logger.error("WorkOS API error during session refresh", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily unavailable. Please try again later.",
        )
    except ValueError as e:
        logger.error(f"Invalid session data: {e!s}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session. Please log in again.",
        )


@router.get("/me", response_model=UserRead)
async def get_me(user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    This endpoint returns the authenticated user's profile information from
    the local database. The user is automatically synced from WorkOS if this
    is their first request.
    
    Authentication:
        Required (session cookie)
    
    Returns:
        UserRead: User profile information including:
            - id: User ID (WorkOS format)
            - email: Email address
            - first_name: First name
            - last_name: Last name
            - email_verified: Email verification status
            - created_at: Account creation timestamp
            
    Example:
        >>> GET /auth/me
        {
            "id": "user_01ABC123",
            "email": "john@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "email_verified": true,
            "created_at": "2024-01-01T00:00:00Z"
        }
    
    Note:
        User is automatically synced from WorkOS if not found in local database.
        This ensures the endpoint always returns user data.
    """
    return user


@router.get("/organizations", response_model=list[OrganizationMembershipResponse])
async def get_my_organizations(
    service: Annotated[WorkOSService, Depends(get_workos_service)],
    session=Depends(get_session),
):
    """
    Get organizations the current user is a member of.
    
    This endpoint returns all organizations the authenticated user belongs to,
    along with their role in each organization. It uses batch fetching to
    optimize database queries and avoid N+1 query problems.
    
    Process:
        1. Fetch organization memberships from WorkOS
        2. Batch fetch all organizations from local database
        3. Sync missing organizations from WorkOS if needed
        4. Combine membership and organization data
        5. Return enriched organization list
    
    Authentication:
        Required (session cookie)
    
    Returns:
        list[OrganizationMembershipResponse]: List of organizations with:
            - id: Membership ID
            - organization_id: Organization ID
            - organization_name: Organization name
            - role: User's role in organization
            
    Example:
        >>> GET /auth/organizations
        [
            {
                "id": "membership_01ABC123",
                "organization_id": "org_01XYZ789",
                "organization_name": "Acme Corp",
                "role": "admin"
            },
            {
                "id": "membership_01DEF456",
                "organization_id": "org_01GHI012",
                "organization_name": "Personal Workspace",
                "role": "admin"
            }
        ]
    
    Performance:
        - Uses batch fetching to avoid N+1 queries
        - Fetches all organizations in a single database query
        - Only syncs missing organizations from WorkOS when needed
    """
    memberships = list_organization_memberships(user_id=session.user.id)

    # Batch fetch all organizations to avoid N+1 query problem
    org_ids = [m.organization_id for m in memberships.data]
    orgs_dict = await service.get_organizations_by_ids(org_ids)

    result = []
    for m in memberships.data:
        org = orgs_dict.get(m.organization_id)
        if not org:
            # Skip if organization not found (shouldn't happen but handle gracefully)
            logger.warning(f"Organization {m.organization_id} not found for user {session.user.id}")
            continue

        # Normalize role to consistent format
        role_slug, _ = normalize_role(m.role if hasattr(m, "role") else None)

        result.append(
            OrganizationMembershipResponse(
                id=m.id,
                organization_id=m.organization_id,
                organization_name=org.name,
                role=role_slug,
            )
        )

    return result


@router.get("/session")
async def get_session_info(session=Depends(get_session)):
    """
    Get current session information.
    
    This endpoint returns the current session context including user ID,
    email, organization ID, and role. It's useful for frontend applications
    to determine the current authentication state and organization context.
    
    Authentication:
        Required (session cookie)
    
    Headers:
        X-Organization-ID: Current organization ID (optional)
        
    Returns:
        dict: Session information:
            - user_id: User ID (WorkOS format)
            - email: User's email address
            - organization_id: Current organization ID (from header or session)
            - role: User's role in current organization
            
    Example:
        >>> GET /auth/session
        {
            "user_id": "user_01ABC123",
            "email": "john@example.com",
            "organization_id": "org_01XYZ789",
            "role": "admin"
        }
    
    Note:
        Organization ID comes from X-Organization-ID header if provided,
        otherwise from the WorkOS session. Role is specific to the current
        organization context.
    """
    return {
        "user_id": session.user.id,
        "email": session.user.email,
        "organization_id": session.organization_id,
        "role": session.role,
    }

