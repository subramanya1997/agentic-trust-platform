"""Input validation and sanitization utilities.

This module provides comprehensive input validation and sanitization functions
to prevent security vulnerabilities like XSS attacks, SQL injection, and
data corruption. All validators are designed to be used with Pydantic models
via Annotated types.

Key Features:
- HTML sanitization to prevent XSS attacks
- Null byte removal to prevent security bypasses
- Email format validation (RFC 5322 compliant)
- URL-safe slug validation
- Role validation against allowed values
- URL format validation

Security Considerations:
- All string inputs are sanitized to remove HTML tags
- Null bytes are removed to prevent security bypasses
- Email validation prevents injection attacks
- Slug validation prevents SQL injection via special characters
- Role validation prevents privilege escalation

Usage:
    from app.core.validators import (
        SanitizedString,
        ValidatedEmail,
        ValidatedSlug,
        ValidatedName,
        ValidatedUrl,
        ValidatedRole
    )
    from pydantic import BaseModel
    
    class MyModel(BaseModel):
        name: ValidatedName  # Automatically sanitized and validated
        email: ValidatedEmail  # Validated email format
        slug: ValidatedSlug  # URL-safe slug
"""

import re
from typing import Annotated

import bleach
from pydantic import AfterValidator, BeforeValidator


def sanitize_string(value: str) -> str:
    """
    Sanitize user input string.
    
    - Removes HTML tags to prevent XSS attacks
    - Removes null bytes that could bypass security checks
    - Normalizes whitespace
    - Strips leading/trailing whitespace
    
    Args:
        value: Input string to sanitize
        
    Returns:
        Sanitized string
        
    Raises:
        TypeError: If value is not a string
    """
    if not isinstance(value, str):
        raise TypeError("String required")
    
    # Remove HTML tags (prevents XSS)
    value = bleach.clean(value, tags=[], strip=True)
    
    # Remove null bytes (prevents null byte injection)
    value = value.replace("\x00", "")
    
    # Normalize whitespace (convert multiple spaces/tabs/newlines to single space)
    value = " ".join(value.split())
    
    # Strip leading/trailing whitespace
    value = value.strip()
    
    return value


def validate_email(value: str) -> str:
    """
    Validate and normalize email address.
    
    - Normalizes to lowercase
    - Validates RFC 5322 compliant format (simplified)
    - Enforces maximum length of 254 characters
    
    Args:
        value: Email address to validate
        
    Returns:
        Normalized email address
        
    Raises:
        ValueError: If email format is invalid or too long
    """
    value = value.lower().strip()
    
    # RFC 5322 compliant regex (simplified)
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, value):
        raise ValueError("Invalid email format")
    
    # Check length (RFC 5321 maximum)
    if len(value) > 254:
        raise ValueError("Email too long (max 254 characters)")
    
    return value


def validate_slug(value: str) -> str:
    """
    Validate URL-safe slug.
    
    - Normalizes to lowercase
    - Allows only alphanumeric characters and hyphens
    - Must start and end with alphanumeric character
    - Cannot contain consecutive hyphens
    - Maximum length of 100 characters
    
    Args:
        value: Slug to validate
        
    Returns:
        Validated slug
        
    Raises:
        ValueError: If slug format is invalid
    """
    value = value.lower().strip()
    
    # Must be alphanumeric with optional hyphens, starting and ending with alphanumeric
    # Allows single character slugs
    if not re.match(r"^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$", value):
        raise ValueError("Slug must contain only lowercase letters, numbers, and hyphens")
    
    # Prevent consecutive hyphens (potential SQL injection vector)
    if "--" in value:
        raise ValueError("Slug cannot contain consecutive hyphens")
    
    # Enforce maximum length
    if len(value) > 100:
        raise ValueError("Slug must be 100 characters or less")
    
    return value


def validate_name(value: str) -> str:
    """
    Validate name field (organization, user, etc.).
    
    - Applies sanitization (HTML stripping, null byte removal)
    - Enforces minimum length of 1 character
    - Enforces maximum length of 255 characters
    
    Args:
        value: Name to validate
        
    Returns:
        Validated name
        
    Raises:
        ValueError: If name is empty or too long after sanitization
    """
    # First sanitize (removes HTML, null bytes, normalizes whitespace)
    value = sanitize_string(value)
    
    # Check minimum length
    if len(value) < 1:
        raise ValueError("Name cannot be empty")
    
    # Check maximum length
    if len(value) > 255:
        raise ValueError("Name must be 255 characters or less")
    
    return value


def validate_url(value: str | None) -> str | None:
    """
    Validate URL format.
    
    - Allows http and https schemes only
    - Prevents special characters that could be used for injection
    - Enforces maximum length of 2048 characters
    
    Args:
        value: URL to validate (can be None)
        
    Returns:
        Validated URL or None
        
    Raises:
        ValueError: If URL format is invalid or too long
    """
    if value is None:
        return None
    
    value = value.strip()
    
    # Basic URL validation - must start with http:// or https://
    # Disallow special characters that could be used for injection
    pattern = r'^https?://[^\s<>"{}|\\^`\[\]]+$'
    if not re.match(pattern, value):
        raise ValueError("Invalid URL format")
    
    # Enforce maximum length
    if len(value) > 2048:
        raise ValueError("URL too long (max 2048 characters)")
    
    return value


def validate_role(value: str) -> str:
    """
    Validate role value.
    
    - Normalizes to lowercase
    - Restricts to known valid roles
    - Prevents arbitrary role injection
    
    Args:
        value: Role to validate
        
    Returns:
        Validated role
        
    Raises:
        ValueError: If role is not in allowed list
    """
    value = value.lower().strip()
    
    # Only allow known roles
    allowed_roles = {"admin", "member", "viewer"}
    if value not in allowed_roles:
        raise ValueError(f"Invalid role. Must be one of: {', '.join(sorted(allowed_roles))}")
    
    return value


# Annotated types for use in Pydantic models
# These apply validation automatically when used in model fields
# Usage: field_name: ValidatedEmail = Field(...)

# Basic sanitized string (HTML stripped, null bytes removed, whitespace normalized)
# Use for any free-form text input that needs sanitization
# Example: description: SanitizedString
SanitizedString = Annotated[str, BeforeValidator(sanitize_string)]

# Email address (validated format and normalized to lowercase)
# Validates RFC 5322 compliant format and enforces max 254 characters
# Example: email: ValidatedEmail
ValidatedEmail = Annotated[str, AfterValidator(validate_email)]

# URL-safe slug (alphanumeric + hyphens only, max 100 chars)
# Must start and end with alphanumeric, no consecutive hyphens
# Example: slug: ValidatedSlug
ValidatedSlug = Annotated[str, AfterValidator(validate_slug)]

# Name field (sanitized + length validation: 1-255 characters)
# Combines sanitization with length checks for name fields
# Example: name: ValidatedName
ValidatedName = Annotated[str, BeforeValidator(sanitize_string), AfterValidator(validate_name)]

# URL (http/https scheme validation, max 2048 characters)
# Allows None for optional URL fields
# Example: logo_url: ValidatedUrl
ValidatedUrl = Annotated[str | None, AfterValidator(validate_url)]

# Role (restricted to known values: admin, member, viewer)
# Normalizes to lowercase and validates against allowed roles
# Example: role: ValidatedRole
ValidatedRole = Annotated[str, AfterValidator(validate_role)]


__all__ = [
    "sanitize_string",
    "validate_email",
    "validate_slug",
    "validate_name",
    "validate_url",
    "validate_role",
    "SanitizedString",
    "ValidatedEmail",
    "ValidatedSlug",
    "ValidatedName",
    "ValidatedUrl",
    "ValidatedRole",
]

