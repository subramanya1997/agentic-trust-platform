"""Role-Based Access Control using WorkOS roles.

This module provides utilities for role-based access control (RBAC) using
WorkOS roles. It includes FastAPI dependencies for route protection and
helper functions for permission checks.

Key Features:
- FastAPI dependency for route-level role requirements
- Helper functions for permission checks
- Role normalization (case-insensitive)
- Clear error messages for unauthorized access

Roles:
    - admin: Full access to all features
    - member: Can create and manage resources
    - viewer: Read-only access

Usage:
    # In route handlers
    from app.core.permissions import require_role
    
    @router.post("/agents", dependencies=[Depends(require_role(["admin", "member"]))])
    async def create_agent(...):
        # Only admins and members can access
        ...
    
    # In business logic
    from app.core.permissions import is_admin, can_invite_members
    
    if is_admin(role):
        # Admin-only logic
        ...
"""

from fastapi import Depends, HTTPException, status


def require_role(allowed_roles: list[str]):
    """
    FastAPI dependency to require specific WorkOS roles.
    
    This function creates a FastAPI dependency that enforces role-based
    access control. Routes using this dependency will only allow users
    with one of the specified roles.
    
    Role Matching:
        - Case-insensitive comparison
        - User's role must match one of the allowed roles
        - Raises 403 Forbidden if role doesn't match
    
    Args:
        allowed_roles: List of role slugs that are allowed
            - Example: ["admin", "member"]
            - Example: ["admin"] (admin only)
    
    Returns:
        FastAPI dependency function
        
    Raises:
        HTTPException: 403 Forbidden if user's role is not in allowed_roles
        
    Example:
        @router.post("/agents")
        async def create_agent(
            _: str = Depends(require_role(["admin", "member"]))
        ):
            # Only admins and members can create agents
            ...
        
        @router.delete("/organizations/{org_id}")
        async def delete_org(
            org_id: str,
            _: str = Depends(require_role(["admin"]))
        ):
            # Only admins can delete organizations
            ...
    
    Note:
        The return value is typically assigned to `_` to indicate it's
        only used for side effects (authorization check).
    """
    from app.dependencies import get_current_role

    async def role_checker(role: str = Depends(get_current_role)):
        if not role or role.lower() not in [r.lower() for r in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of these roles: {', '.join(allowed_roles)}",
            )
        return role

    return role_checker


def is_admin(role: str | None) -> bool:
    """
    Check if role is admin.
    
    Args:
        role: Role slug to check (can be None)
        
    Returns:
        bool: True if role is "admin" (case-insensitive), False otherwise
        
    Example:
        >>> is_admin("admin")
        True
        >>> is_admin("Admin")
        True
        >>> is_admin("member")
        False
        >>> is_admin(None)
        False
    """
    return role and role.lower() == "admin"


def can_manage_team(role: str | None) -> bool:
    """
    Check if role can manage team members.
    
    Team management includes:
    - Inviting new members
    - Updating member roles
    - Removing members
    
    Args:
        role: Role slug to check (can be None)
        
    Returns:
        bool: True if role can manage team, False otherwise
        
    Example:
        >>> can_manage_team("admin")
        True
        >>> can_manage_team("member")
        False
    """
    return role and role.lower() in ["admin"]


def can_invite_members(role: str | None) -> bool:
    """
    Check if role can invite new team members.
    
    Args:
        role: Role slug to check (can be None)
        
    Returns:
        bool: True if role can invite members, False otherwise
        
    Example:
        >>> can_invite_members("admin")
        True
        >>> can_invite_members("member")
        True
        >>> can_invite_members("viewer")
        False
    """
    return role and role.lower() in ["admin", "member"]

