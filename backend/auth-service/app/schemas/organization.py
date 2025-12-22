"""Organization management request and response schemas."""

from pydantic import BaseModel, Field

from app.core.validators import ValidatedEmail, ValidatedName, ValidatedUrl


class OrganizationCreateRequest(BaseModel):
    """Request to create a new organization."""

    name: ValidatedName = Field(..., min_length=1, max_length=255)


class OrganizationUpdateRequest(BaseModel):
    """Request to update organization settings."""

    name: ValidatedName | None = Field(None, min_length=1, max_length=255)
    logo_url: ValidatedUrl = None
    billing_email: ValidatedEmail | None = None
    settings: dict | None = None


__all__ = [
    "OrganizationCreateRequest",
    "OrganizationUpdateRequest",
]

