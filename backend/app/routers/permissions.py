"""Permission information routes."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.permissions import ROLE_PERMISSIONS, Permission, get_role_permissions
from app.dependencies import get_current_role

router = APIRouter()


class PermissionInfo(BaseModel):
    """Permission details."""

    code: str
    name: str
    category: str


class RoleInfo(BaseModel):
    """Role with its permissions."""

    name: str
    permissions: list[str]


class MyPermissions(BaseModel):
    """Current user's role and permissions."""

    role: str
    permissions: list[str]


def get_permission_info(perm: Permission) -> PermissionInfo:
    """Convert permission enum to info object."""
    parts = perm.value.split(".")
    category = parts[0].title()
    name = " ".join(parts).replace(".", " ").title()
    return PermissionInfo(code=perm.value, name=name, category=category)


@router.get("/all", response_model=list[PermissionInfo])
async def list_all_permissions():
    """List all available permissions in the system."""
    return [get_permission_info(p) for p in Permission]


@router.get("/roles", response_model=list[RoleInfo])
async def list_roles():
    """List all roles and their permissions."""
    return [
        RoleInfo(name=role, permissions=get_role_permissions(role))
        for role in ROLE_PERMISSIONS.keys()
    ]


@router.get("/me", response_model=MyPermissions)
async def get_my_permissions(
    role: str = Depends(get_current_role),
):
    """Get current user's role and permissions."""
    return MyPermissions(
        role=role,
        permissions=get_role_permissions(role),
    )


@router.get("/check/{permission}")
async def check_permission(
    permission: str,
    role: str = Depends(get_current_role),
):
    """Check if current user has a specific permission."""
    from app.core.permissions import has_permission

    try:
        perm = Permission(permission)
        allowed = has_permission(role, perm)
        return {"permission": permission, "allowed": allowed, "role": role}
    except ValueError:
        return {"permission": permission, "allowed": False, "error": "Invalid permission"}

