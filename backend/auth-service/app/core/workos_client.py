"""WorkOS client configuration and helper functions.

This module provides a centralized WorkOS client and wrapper functions for
all WorkOS API interactions. All functions are protected with circuit breakers
to prevent cascading failures.

Key Features:
- Centralized WorkOS client configuration
- Circuit breaker protection on all API calls
- Sealed session handling (encrypted cookies)
- User and organization management
- Team member management
- Audit log syncing
- Role management

WorkOS Integration:
    - User Management: OAuth, sessions, user CRUD
    - Organizations: Organization CRUD and management
    - Team Management: Memberships, invitations, roles
    - Audit Logs: Event syncing for compliance

Session Handling:
    - Sealed sessions: Encrypted session cookies for security
    - Session refresh: Automatic token refresh without re-authentication
    - Session validation: Verify session authenticity with WorkOS

Usage:
    from app.core.workos_client import (
        get_authorization_url,
        authenticate_with_code,
        load_sealed_session
    )
    
    # Get OAuth URL
    url = get_authorization_url(provider="GoogleOAuth")
    
    # Authenticate with code
    result = authenticate_with_code(code)
    
    # Load session
    session = load_sealed_session(sealed_session)
"""

import logging

import httpx
from workos import WorkOSClient
from workos.types.user_management import User as WorkOSUser

from app.config import settings
from app.core.circuit_breaker import with_circuit_breaker

logger = logging.getLogger(__name__)

# Initialize WorkOS client
# This client is used for all WorkOS API interactions
client = WorkOSClient(
    api_key=settings.workos_api_key,
    client_id=settings.workos_client_id,
)


@with_circuit_breaker("workos")
def get_authorization_url(
    redirect_uri: str | None = None,
    state: str | None = None,
    provider: str = "authkit",
    organization_id: str | None = None,
) -> str:
    """
    Generate WorkOS authorization URL for OAuth login.

    This function creates the OAuth authorization URL that users are redirected
    to for authentication. The URL includes all necessary parameters for
    the OAuth flow.

    OAuth Providers:
        - "authkit": WorkOS AuthKit (default, supports multiple providers)
        - "GoogleOAuth": Google OAuth
        - "MicrosoftOAuth": Microsoft OAuth
        - "GitHubOAuth": GitHub OAuth
        - Custom providers configured in WorkOS

    CSRF Protection:
        The state parameter should be a cryptographically random token that
        is validated on callback to prevent CSRF attacks.

    Args:
        redirect_uri: Where to redirect after authentication
                     (defaults to WORKOS_REDIRECT_URI from settings)
        state: CSRF state token for security (should be random, 32+ chars)
        provider: OAuth provider name (default: "authkit")
        organization_id: Optional organization ID for SSO login
                        (if provided, user must be member of this org)

    Returns:
        str: Complete authorization URL to redirect user to

    Example:
        >>> import secrets
        >>> state = secrets.token_urlsafe(32)
        >>> url = get_authorization_url(
        ...     provider="GoogleOAuth",
        ...     state=state
        ... )
        >>> # Redirect user to url

    Note:
        Protected with circuit breaker. Raises CircuitBreakerError if
        WorkOS API is unavailable.
    """
    return client.user_management.get_authorization_url(
        redirect_uri=redirect_uri or settings.workos_redirect_uri,
        provider=provider,
        state=state,
        organization_id=organization_id,
    )


@with_circuit_breaker("workos")
def authenticate_with_code(code: str) -> dict:
    """
    Exchange OAuth authorization code for user and session.

    This function completes the OAuth flow by exchanging the authorization
    code (received from OAuth callback) for user information and a sealed
    session token. The sealed session is an encrypted cookie that can be
    used for subsequent authenticated requests.

    OAuth Flow:
        1. User redirected to authorization URL
        2. User authenticates with provider
        3. Provider redirects to callback with code
        4. This function exchanges code for session
        5. Sealed session stored in HTTP-only cookie

    Sealed Session:
        - Encrypted with WORKOS_COOKIE_PASSWORD
        - HTTP-only cookie (prevents XSS attacks)
        - Contains user info and refresh token
        - Validated on each request via load_sealed_session()

    Args:
        code: Authorization code from OAuth callback (single-use, expires quickly)

    Returns:
        dict: Dictionary containing:
            - user: WorkOSUser object with user information
            - sealed_session: Encrypted session token (for cookie)
            - access_token: OAuth access token (for API calls)
            - refresh_token: OAuth refresh token (for token refresh)

    Raises:
        httpx.HTTPStatusError: If code is invalid or expired
        httpx.RequestError: If network request fails
        CircuitBreakerError: If WorkOS API is unavailable

    Example:
        >>> # In OAuth callback handler
        >>> result = authenticate_with_code(code)
        >>> user = result["user"]
        >>> sealed_session = result["sealed_session"]
        >>> # Set sealed_session as HTTP-only cookie

    Note:
        The authorization code is single-use and expires quickly (typically
        within minutes). Must be exchanged immediately after receiving it.
    """
    response = client.user_management.authenticate_with_code(
        code=code,
        session={
            "seal_session": True,  # Request sealed (encrypted) session
            "cookie_password": settings.workos_cookie_password,  # Encryption key
        },
    )

    return {
        "user": response.user,
        "sealed_session": response.sealed_session,
        "access_token": response.access_token,
        "refresh_token": response.refresh_token,
    }


@with_circuit_breaker("workos")
def load_sealed_session(sealed_session: str):
    """
    Load and validate a sealed session using WorkOS Python SDK.

    This function decrypts and validates a sealed session cookie, extracting
    user information and role. It's called on every authenticated request
    to verify the session is still valid.

    Session Validation:
        - Decrypts sealed session with WORKOS_COOKIE_PASSWORD
        - Validates session hasn't expired
        - Checks refresh token is still valid
        - Extracts user information and role
        - Returns authentication status

    Session Expiration:
        - Sessions expire after configured duration (default: 7 days)
        - Refresh tokens can extend session without re-authentication
        - Expired sessions return authenticated=False

    Args:
        sealed_session: The encrypted session cookie value from HTTP cookie

    Returns:
        AuthenticateWithSessionCookieSuccessResponse object containing:
            - authenticated: bool - Whether session is valid
            - user: WorkOSUser - User information
            - role: str - User's role in organization
            - organization_id: str - Current organization ID
            - reason: str - Reason if authentication failed (optional)

    Raises:
        ValueError: If session is invalid, expired, or decryption fails
        httpx.RequestError: If network request to WorkOS fails
        CircuitBreakerError: If WorkOS API is unavailable

    Example:
        >>> # In route handler
        >>> sealed_session = request.cookies.get("wos-session")
        >>> auth_response = load_sealed_session(sealed_session)
        >>> if auth_response.authenticated:
        ...     user = auth_response.user
        ...     role = auth_response.role

    Note:
        This function is called on every authenticated request. Consider
        caching results if performance is critical (with appropriate
        cache invalidation on session changes).
    """
    try:
        # WorkOS Python SDK v5.x - load the sealed session
        # This returns a Session object that can be authenticated
        session = client.user_management.load_sealed_session(
            sealed_session=sealed_session,
            cookie_password=settings.workos_cookie_password,
        )
        
        # Authenticate the session to get user data and role
        # This validates the session and extracts user information
        auth_response = session.authenticate()
        
        # Check authentication FIRST before accessing user
        # Prevents AttributeError if session is invalid
        if not auth_response.authenticated:
            reason = getattr(auth_response, "reason", "unknown")
            raise ValueError(f"Session is not authenticated or expired: {reason}")
        
        return auth_response
    except ValueError:
        # Re-raise ValueError (invalid/expired session)
        raise
    except httpx.RequestError as e:
        # Log network errors for debugging
        logger.error("Network error loading sealed session", exc_info=True, extra={"error": str(e)})
        raise
    except Exception as e:
        # Catch-all for unexpected errors
        logger.error("Unexpected error loading sealed session", exc_info=True, extra={"error": str(e)})
        raise ValueError(f"Failed to load sealed session: {e!s}")


@with_circuit_breaker("workos")
def refresh_sealed_session(sealed_session: str):
    """
    Refresh a sealed session and return new sealed session data.
    
    This function extends a user's session without requiring re-authentication.
    It uses the refresh token embedded in the sealed session to obtain a new
    access token and sealed session cookie.
    
    Session Refresh Flow:
        1. Load existing sealed session
        2. Extract refresh token from session
        3. Exchange refresh token for new access token
        4. Generate new sealed session with updated tokens
        5. Return new sealed session for cookie update
    
    When to Refresh:
        - Before session expires (proactive refresh)
        - When access token expires (reactive refresh)
        - On session validation failure (retry mechanism)
    
    Refresh Token Expiration:
        - Refresh tokens have longer expiration than access tokens
        - If refresh token expires, user must re-authenticate
        - Default refresh token expiration: 30 days (WorkOS default)
    
    Args:
        sealed_session: The encrypted session cookie value to refresh
    
    Returns:
        dict: Dictionary containing:
            - authenticated: bool - Whether refresh succeeded
            - sealed_session: str - New sealed session token (if authenticated=True)
            - user: WorkOSUser - User information (if authenticated=True)
            - reason: str - Failure reason (if authenticated=False)
    
    Example:
        >>> result = refresh_sealed_session(old_session)
        >>> if result["authenticated"]:
        ...     new_session = result["sealed_session"]
        ...     # Update cookie with new_session
        ... else:
        ...     # Refresh failed, user must re-login
        ...     reason = result["reason"]
    
    Note:
        This function does NOT raise exceptions. Always check the
        "authenticated" field in the return value to determine success.
    """
    try:
        # Load the sealed session
        session = client.user_management.load_sealed_session(
            sealed_session=sealed_session,
            cookie_password=settings.workos_cookie_password,
        )
        
        # Refresh the session to get a new access token
        # This uses the refresh token to obtain new tokens without re-authentication
        refresh_result = session.refresh()
        
        if refresh_result.authenticated:
            logger.info("Session refreshed successfully")
            return {
                "sealed_session": refresh_result.sealed_session,
                "user": refresh_result.user,
                "authenticated": True,
            }
        
        # Refresh failed (refresh token expired or invalid)
        reason = getattr(refresh_result, "reason", "unknown")
        logger.warning(f"Session refresh failed: {reason}")
        return {
            "authenticated": False,
            "reason": reason
        }
    except Exception as e:
        # Catch any unexpected errors during refresh
        logger.error(f"Failed to refresh sealed session: {e}")
        return {
            "authenticated": False,
            "reason": str(e)
        }


@with_circuit_breaker("workos")
def get_user(user_id: str) -> WorkOSUser:
    """Get user details from WorkOS."""
    return client.user_management.get_user(user_id)


@with_circuit_breaker("workos")
def list_organization_memberships(
    user_id: str | None = None,
    organization_id: str | None = None,
    limit: int = 100,
):
    """
    List organization memberships.
    
    Args:
        user_id: Optional user ID to filter memberships for a specific user
        organization_id: Optional organization ID to filter memberships for a specific org
        limit: Maximum number of results to return
    
    Returns:
        List of organization memberships
    """
    kwargs = {"limit": limit}
    if user_id:
        kwargs["user_id"] = user_id
    if organization_id:
        kwargs["organization_id"] = organization_id

    return client.user_management.list_organization_memberships(**kwargs)


@with_circuit_breaker("workos")
def get_organization(organization_id: str):
    """Get organization details from WorkOS."""
    return client.organizations.get_organization(organization_id)


@with_circuit_breaker("workos")
def create_organization(name: str):
    """Create a new organization in WorkOS."""
    return client.organizations.create_organization(name=name)


@with_circuit_breaker("workos")
def create_organization_membership(user_id: str, organization_id: str, role: str = "admin"):
    """
    Create an organization membership for a user.
    
    Args:
        user_id: The WorkOS user ID
        organization_id: The WorkOS organization ID
        role: The role to assign (default: "admin")
    
    Returns:
        OrganizationMembership object from WorkOS
    """
    return client.user_management.create_organization_membership(
        user_id=user_id,
        organization_id=organization_id,
        role_slug=role,
    )


# Team Management Functions


@with_circuit_breaker("workos")
def get_organization_membership(membership_id: str):
    """Get a specific membership by ID."""
    return client.user_management.get_organization_membership(membership_id)


@with_circuit_breaker("workos")
def update_organization_membership(membership_id: str, role: str):
    """Update a membership's role."""
    return client.user_management.update_organization_membership(
        organization_membership_id=membership_id,
        role_slug=role,  # WorkOS SDK uses 'role_slug' parameter
    )


@with_circuit_breaker("workos")
def delete_organization_membership(membership_id: str):
    """Delete a membership."""
    return client.user_management.delete_organization_membership(membership_id)


@with_circuit_breaker("workos")
def send_invitation(email: str, organization_id: str, role: str, inviter_user_id: str):
    """Send invitation to join organization."""
    return client.user_management.send_invitation(
        email=email,
        organization_id=organization_id,
        role_slug=role,  # WorkOS SDK uses 'role_slug' parameter
        inviter_user_id=inviter_user_id,
    )


@with_circuit_breaker("workos")
def list_invitations(organization_id: str):
    """List pending invitations for an organization."""
    return client.user_management.list_invitations(organization_id=organization_id)


@with_circuit_breaker("workos")
def revoke_invitation(invitation_id: str):
    """Revoke a pending invitation."""
    return client.user_management.revoke_invitation(invitation_id)


@with_circuit_breaker("workos")
def resend_invitation(invitation_id: str):
    """Resend a pending invitation using WorkOS SDK."""
    try:
        # WorkOS Python SDK v5.x+ supports resending invitations
        return client.user_management.resend_invitation(invitation_id)
    except httpx.HTTPStatusError as e:
        logger.error("HTTP error resending invitation", exc_info=True, extra={"invitation_id": invitation_id, "error": str(e)})
        raise
    except httpx.RequestError as e:
        logger.error("Network error resending invitation", exc_info=True, extra={"invitation_id": invitation_id, "error": str(e)})
        raise


@with_circuit_breaker("workos")
def list_roles():
    """List available roles from WorkOS."""
    try:
        return client.user_management.list_roles()
    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        logger.warning("Failed to list roles from WorkOS", extra={"error": str(e)})
        # If roles API isn't available, return empty
        return type("obj", (object,), {"data": []})()


@with_circuit_breaker("workos")
def list_organization_roles(organization_id: str):
    """
    List roles for a specific organization with their permissions.
    
    This uses the WorkOS REST API directly since the Python SDK may not
    have this endpoint exposed.
    
    Args:
        organization_id: The WorkOS organization ID
    
    Returns:
        List of roles with their permissions
    """

    
    url = f"https://api.workos.com/organizations/{organization_id}/roles"
    headers = {
        "Authorization": f"Bearer {settings.workos_api_key}",
        "Content-Type": "application/json",
    }
    
    try:
        response = httpx.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        logger.warning("Failed to list organization roles", extra={"organization_id": organization_id, "error": str(e)})
        # Return default roles if API call fails
        return {
            "data": [],
        }


# Audit Logs Functions


@with_circuit_breaker("workos")
def list_audit_log_events(
    organization_id: str,
    limit: int = 50,
    after: str | None = None,
    before: str | None = None,
):
    """
    List audit log events for an organization using WorkOS SDK.
    
    Args:
        organization_id: The organization ID
        limit: Maximum number of events to return (default 50)
        after: Cursor for pagination (events after this ID)
        before: Cursor for pagination (events before this ID)
    
    Returns:
        List of audit log events from WorkOS
    """
    try:
        kwargs = {
            "organization_id": organization_id,
            "limit": limit,
        }
        if after:
            kwargs["after"] = after
        if before:
            kwargs["before"] = before
            
        events = client.audit_logs.list_events(**kwargs)
        logger.info(f"Fetched {len(events.data) if hasattr(events, 'data') else 0} audit log events for org {organization_id}")
        return events
    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        logger.error("Failed to list audit log events", exc_info=True, extra={"organization_id": organization_id, "error": str(e)})
        # Return empty result on error
        return type("obj", (object,), {
            "data": [],
            "list_metadata": {"before": None, "after": None}
        })()