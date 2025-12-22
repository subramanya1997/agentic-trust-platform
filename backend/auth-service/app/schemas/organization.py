"""Organization management request and response schemas.

This module defines Pydantic schemas for organization management API requests.
These schemas include validation using custom validators for security.

Schemas:
    - OrganizationCreateRequest: Create new organization
    - OrganizationUpdateRequest: Update organization settings

Validation:
    - Names are sanitized (HTML stripped, null bytes removed)
    - URLs are validated (http/https only, max 2048 chars)
    - Emails are validated (RFC 5322 format, normalized to lowercase)

Usage:
    @router.post("/organizations", response_model=OrganizationRead)
    async def create_org(data: OrganizationCreateRequest):
        ...
"""

from pydantic import BaseModel, Field

from app.core.validators import ValidatedEmail, ValidatedName, ValidatedUrl


class OrganizationCreateRequest(BaseModel):
    """
    Request to create a new organization.
    
    This schema is used when creating a new organization via the API.
    The name is validated and sanitized to prevent XSS attacks.
    
    Attributes:
        name (ValidatedName): Organization name (1-255 chars, sanitized)
            - HTML tags are stripped
            - Null bytes are removed
            - Whitespace is normalized
            
    Example:
        {
            "name": "Acme Corporation"
        }
        
    Validation:
        - Minimum length: 1 character
        - Maximum length: 255 characters
        - HTML tags are automatically stripped
        - Null bytes are removed
    """

    name: ValidatedName = Field(..., min_length=1, max_length=255)


class OrganizationUpdateRequest(BaseModel):
    """
    Request to update organization settings.
    
    This schema is used when updating an organization's settings. All fields
    are optional - only provided fields will be updated.
    
    Attributes:
        name (ValidatedName | None): New organization name (optional)
        logo_url (ValidatedUrl | None): URL to organization logo (optional)
        billing_email (ValidatedEmail | None): Email for billing notifications (optional)
        settings (dict | None): Organization settings dictionary (optional)
            - Merged with existing settings (not replaced)
            - Can contain any JSON-serializable data
            
    Example:
        {
            "name": "Updated Name",
            "logo_url": "https://example.com/logo.png",
            "billing_email": "billing@example.com",
            "settings": {
                "theme": "dark",
                "notifications": true
            }
        }
        
    Validation:
        - name: Same validation as OrganizationCreateRequest
        - logo_url: Must be http:// or https://, max 2048 chars
        - billing_email: Valid email format, normalized to lowercase
        - settings: Any valid JSON object
    """

    name: ValidatedName | None = Field(None, min_length=1, max_length=255)
    logo_url: ValidatedUrl = None
    billing_email: ValidatedEmail | None = None
    settings: dict | None = None


__all__ = [
    "OrganizationCreateRequest",
    "OrganizationUpdateRequest",
]

