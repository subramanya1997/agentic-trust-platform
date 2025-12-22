"""Authentication-related request and response schemas.

This module defines Pydantic schemas for authentication API requests and responses.
These schemas are used by FastAPI for request validation and response serialization.

Schemas:
    - AuthURLResponse: OAuth authorization URL response
    - AuthCallbackResponse: OAuth callback response
    - OrganizationMembershipResponse: User's organization membership info

Usage:
    These schemas are used as response_model in route handlers:
    
    @router.get("/auth/login-url", response_model=AuthURLResponse)
    async def get_login_url(...):
        return AuthURLResponse(authorization_url=url)
"""

from pydantic import BaseModel


class AuthURLResponse(BaseModel):
    """
    Response with OAuth authorization URL.
    
    This schema is returned by the /auth/login-url endpoint. It contains
    the URL that the frontend should redirect the user to for OAuth
    authentication.
    
    Attributes:
        authorization_url (str): Complete OAuth authorization URL to redirect user to
        
    Example:
        {
            "authorization_url": "https://api.workos.com/authorize?client_id=...&redirect_uri=..."
        }
    """

    authorization_url: str


class AuthCallbackResponse(BaseModel):
    """
    Response from OAuth callback endpoint.
    
    This schema is returned by the /auth/callback endpoint after successful
    authentication. It indicates whether authentication succeeded and provides
    the user ID.
    
    Attributes:
        success (bool): Whether authentication was successful
        user_id (str): WorkOS user ID of the authenticated user
        
    Example:
        {
            "success": true,
            "user_id": "user_01ABC123"
        }
    """

    success: bool
    user_id: str


class OrganizationMembershipResponse(BaseModel):
    """
    Organization membership information for a user.
    
    This schema represents a user's membership in an organization, including
    their role. It's used when listing a user's organizations.
    
    Attributes:
        id (str): Membership ID (WorkOS organization membership ID)
        organization_id (str): Organization ID (WorkOS organization ID)
        organization_name (str): Human-readable organization name
        role (str): User's role in the organization ("admin", "member", "viewer")
        
    Example:
        {
            "id": "membership_01ABC123",
            "organization_id": "org_01XYZ789",
            "organization_name": "Acme Corp",
            "role": "admin"
        }
    """

    id: str
    organization_id: str
    organization_name: str
    role: str


__all__ = [
    "AuthURLResponse",
    "AuthCallbackResponse",
    "OrganizationMembershipResponse",
]

