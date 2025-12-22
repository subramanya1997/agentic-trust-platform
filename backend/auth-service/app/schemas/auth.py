"""Authentication-related request and response schemas."""

from pydantic import BaseModel


class AuthURLResponse(BaseModel):
    """Response with authorization URL."""

    authorization_url: str


class AuthCallbackResponse(BaseModel):
    """Response from auth callback."""

    success: bool
    user_id: str


class OrganizationMembershipResponse(BaseModel):
    """Organization membership info."""

    id: str
    organization_id: str
    organization_name: str
    role: str


__all__ = [
    "AuthURLResponse",
    "AuthCallbackResponse",
    "OrganizationMembershipResponse",
]

