"""Role handling utilities for WorkOS integration."""


def normalize_role(role_value) -> tuple[str, str]:
    """
    Normalize role value to (slug, display_name).
    
    WorkOS may return role as:
    - An enum (OrganizationMembershipRole.MEMBER)
    - A dict with 'slug' key
    - A string like "member", "admin", or "Member", "Admin"
    
    Args:
        role_value: Role value from WorkOS in any format
        
    Returns:
        Tuple of (slug, display_name) where slug is lowercase and display_name is capitalized
    """
    if role_value is None:
        return "member", "Member"
    
    # Handle enum
    if hasattr(role_value, "value"):
        role_str = str(role_value.value)
    # Handle dict (from role object)
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

