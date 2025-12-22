"""Role handling utilities for WorkOS integration.

This module provides utilities for normalizing and handling role values
from WorkOS. WorkOS may return roles in various formats (enum, dict, string),
so this module provides a consistent normalization function.

Key Features:
- Handles multiple role formats from WorkOS
- Normalizes to consistent slug format
- Provides human-readable display names

Usage:
    from app.core.roles import normalize_role
    
    # Normalize role from WorkOS
    slug, display_name = normalize_role(role_value)
    # Returns: ("admin", "Admin") or ("member", "Member")
"""


def normalize_role(role_value) -> tuple[str, str]:
    """
    Normalize role value to (slug, display_name).
    
    WorkOS may return role values in various formats:
    - Enum objects (OrganizationMembershipRole.MEMBER)
    - Dict objects with 'slug' or 'name' keys
    - String values like "member", "admin", "Member", "Admin"
    
    This function normalizes all formats to a consistent (slug, display_name) tuple
    where slug is always lowercase and display_name is properly capitalized.
    
    Args:
        role_value: Role value from WorkOS in any format:
            - Enum: OrganizationMembershipRole.MEMBER
            - Dict: {"slug": "admin", "name": "Administrator"}
            - String: "admin", "Admin", "ADMIN", "member"
            - None: defaults to "member"
        
    Returns:
        tuple[str, str]: Tuple of (slug, display_name) where:
            - slug: Lowercase role slug (e.g., "admin", "member", "viewer")
            - display_name: Capitalized display name (e.g., "Admin", "Member", "Viewer")
        
    Example:
        >>> normalize_role("admin")
        ("admin", "Admin")
        
        >>> normalize_role("Member")
        ("member", "Member")
        
        >>> normalize_role({"slug": "admin"})
        ("admin", "Admin")
        
        >>> normalize_role(None)
        ("member", "Member")
        
        >>> normalize_role(OrganizationMembershipRole.ADMIN)
        ("admin", "Admin")
    
    Supported Roles:
        - "admin" -> "Admin"
        - "member" -> "Member"
        - "viewer" -> "Viewer"
        - Unknown roles -> Title case of input
    """
    if role_value is None:
        return "member", "Member"
    
    # Handle enum (e.g., OrganizationMembershipRole.MEMBER)
    if hasattr(role_value, "value"):
        role_str = str(role_value.value)
    # Handle dict (from role object with slug/name keys)
    elif isinstance(role_value, dict):
        role_str = role_value.get("slug", role_value.get("name", "member"))
    else:
        role_str = str(role_value)
    
    # Normalize to lowercase slug
    slug = role_str.lower().strip()
    
    # Map to display name
    display_names = {
        "admin": "Admin",
        "member": "Member",
        "viewer": "Viewer",
    }
    display_name = display_names.get(slug, role_str.title())
    
    return slug, display_name

