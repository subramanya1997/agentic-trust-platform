"""WorkOS client configuration and helper functions."""

import logging

import httpx
from workos import WorkOSClient
from workos.types.user_management import User as WorkOSUser

from app.config import settings
from app.core.circuit_breaker import with_circuit_breaker

logger = logging.getLogger(__name__)

# Initialize WorkOS client
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
    Generate WorkOS authorization URL for login.

    Args:
        redirect_uri: Where to redirect after auth (defaults to settings)
        state: Optional state parameter for CSRF protection
        provider: Auth provider ("authkit", "GoogleOAuth", "MicrosoftOAuth", etc.)
        organization_id: Optional org ID for SSO login

    Returns:
        Authorization URL to redirect user to
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
    Exchange authorization code for user and session.

    Args:
        code: Authorization code from callback

    Returns:
        Dict with user, sealed_session, access_token, refresh_token
    """
    response = client.user_management.authenticate_with_code(
        code=code,
        session={
            "seal_session": True,
            "cookie_password": settings.workos_cookie_password,
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

    Args:
        sealed_session: The encrypted session cookie value

    Returns:
        AuthenticateWithSessionCookieSuccessResponse with user info and role

    Raises:
        ValueError: If session is invalid or expired
        httpx.RequestError: If network request fails
    """
    try:
        # WorkOS Python SDK v5.x - load the sealed session
        # This returns a Session object
        session = client.user_management.load_sealed_session(
            sealed_session=sealed_session,
            cookie_password=settings.workos_cookie_password,
        )
        
        # Authenticate the session to get user data and role
        auth_response = session.authenticate()
        
        # Check authentication FIRST before accessing user
        if not auth_response.authenticated:
            reason = getattr(auth_response, "reason", "unknown")
            raise ValueError(f"Session is not authenticated or expired: {reason}")
        
        return auth_response
    except ValueError:
        raise
    except httpx.RequestError as e:
        logger.error("Network error loading sealed session", exc_info=True, extra={"error": str(e)})
        raise
    except Exception as e:
        logger.error("Unexpected error loading sealed session", exc_info=True, extra={"error": str(e)})
        raise ValueError(f"Failed to load sealed session: {e!s}")


@with_circuit_breaker("workos")
def refresh_sealed_session(sealed_session: str):
    """
    Refresh a sealed session and return new sealed session data.
    
    Uses WorkOS session refresh to obtain a new access token without requiring
    the user to log in again, as long as the refresh token is still valid.
    
    Args:
        sealed_session: The encrypted session cookie value
    
    Returns:
        Dict with sealed_session, user, and authenticated status
    """
    try:
        # Load the sealed session
        session = client.user_management.load_sealed_session(
            sealed_session=sealed_session,
            cookie_password=settings.workos_cookie_password,
        )
        
        # Refresh the session to get a new access token
        refresh_result = session.refresh()
        
        if refresh_result.authenticated:
            logger.info("Session refreshed successfully")
            return {
                "sealed_session": refresh_result.sealed_session,
                "user": refresh_result.user,
                "authenticated": True,
            }
        
        logger.warning(f"Session refresh failed: {getattr(refresh_result, 'reason', 'unknown')}")
        return {
            "authenticated": False,
            "reason": getattr(refresh_result, "reason", "unknown")
        }
    except Exception as e:
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