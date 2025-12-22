"""Authentication routes using WorkOS."""

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
from app.core.exceptions import DatabaseError, WorkOSError
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
    """Get WorkOS authorization URL for login.
    
    Args:
        request: FastAPI request (required for rate limiting)
        redirect_uri: Where to redirect after auth
        provider: OAuth provider - "GoogleOAuth", "GitHubOAuth", or "authkit"
    
    Rate limit: 10 requests per minute per IP address.
    
    CSRF Protection: Generates a cryptographic state token, stores hash in secure cookie.
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
    """Handle WorkOS OAuth callback.
    
    Rate limit: 20 requests per minute per IP address.
    
    CSRF Protection: Validates state parameter matches the cookie hash.
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
    """Log out user by clearing session cookie."""
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
    
    Uses the WorkOS refresh token to obtain a new access token without
    requiring the user to log in again.
    
    Rate limit: 10 requests per minute per IP address.
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
    """Get current authenticated user."""
    return user


@router.get("/organizations", response_model=list[OrganizationMembershipResponse])
async def get_my_organizations(
    service: Annotated[WorkOSService, Depends(get_workos_service)],
    session=Depends(get_session),
):
    """Get organizations the current user is a member of."""
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
    """Get current session information."""
    return {
        "user_id": session.user.id,
        "email": session.user.email,
        "organization_id": session.organization_id,
        "role": session.role,
    }

