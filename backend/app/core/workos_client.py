"""WorkOS client configuration and helper functions."""

import workos
from workos.types.user_management import User as WorkOSUser

from app.config import settings

# Initialize WorkOS SDK
workos.api_key = settings.workos_api_key
workos.client_id = settings.workos_client_id


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
    return workos.client.user_management.get_authorization_url(
        redirect_uri=redirect_uri or settings.workos_redirect_uri,
        provider=provider,
        state=state,
        organization_id=organization_id,
    )


def authenticate_with_code(code: str) -> dict:
    """
    Exchange authorization code for user and session.

    Args:
        code: Authorization code from callback

    Returns:
        Dict with user, sealed_session, access_token, refresh_token
    """
    response = workos.client.user_management.authenticate_with_code(
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


def load_sealed_session(sealed_session: str):
    """
    Load and validate a sealed session.

    Args:
        sealed_session: The encrypted session cookie value

    Returns:
        Session object with user and organization info

    Raises:
        Exception if session is invalid or expired
    """
    return workos.client.user_management.load_sealed_session(
        sealed_session=sealed_session,
        cookie_password=settings.workos_cookie_password,
    )


def get_user(user_id: str) -> WorkOSUser:
    """Get user details from WorkOS."""
    return workos.client.user_management.get_user(user_id)


def list_organization_memberships(
    user_id: str,
    organization_id: str | None = None,
    limit: int = 100,
):
    """List organization memberships for a user."""
    kwargs = {"user_id": user_id, "limit": limit}
    if organization_id:
        kwargs["organization_id"] = organization_id

    return workos.client.user_management.list_organization_memberships(**kwargs)


def get_organization(organization_id: str):
    """Get organization details from WorkOS."""
    return workos.client.organizations.get_organization(organization_id)


def create_organization(name: str, allow_profiles_outside_organization: bool = True):
    """Create a new organization in WorkOS."""
    return workos.client.organizations.create_organization(
        name=name,
        allow_profiles_outside_organization=allow_profiles_outside_organization,
    )

