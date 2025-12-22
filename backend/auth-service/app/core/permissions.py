"""Role-Based Access Control using WorkOS roles."""

from fastapi import Depends, HTTPException, status


def require_role(allowed_roles: list[str]):
    """
    FastAPI dependency to require specific WorkOS roles.
    
    Args:
        allowed_roles: List of role slugs that are allowed (e.g., ["admin", "member"])
    
    Example:
        @router.post("/agents", dependencies=[require_role(["admin", "member"])])
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
    """Check if role is admin."""
    return role and role.lower() == "admin"


def can_manage_team(role: str | None) -> bool:
    """Check if role can manage team members."""
    return role and role.lower() in ["admin"]


def can_invite_members(role: str | None) -> bool:
    """Check if role can invite members."""
    return role and role.lower() in ["admin", "member"]

