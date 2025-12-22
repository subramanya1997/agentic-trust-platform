"""Permission and role-related request and response schemas."""

from pydantic import BaseModel


class RoleInfo(BaseModel):
    """Role information from WorkOS."""

    slug: str
    name: str
    description: str | None = None


class RoleWithPermissions(BaseModel):
    """Role information with associated permissions from WorkOS."""

    id: str
    slug: str
    name: str
    description: str | None = None
    permissions: list[str] = []
    type: str = "EnvironmentRole"


class PermissionInfo(BaseModel):
    """Permission information derived from roles."""

    id: str
    name: str
    description: str
    category: str


class RolePermissionMapping(BaseModel):
    """Mapping of role to its permissions."""

    roleId: str
    roleName: str
    permissions: list[str]


class PermissionsResponse(BaseModel):
    """Full permissions response for the organization."""

    roles: list[RoleWithPermissions]
    permissions: list[PermissionInfo]
    rolePermissions: list[RolePermissionMapping]


class MyRoleResponse(BaseModel):
    """Current user's role in organization."""

    role: str | None
    organization_id: str | None


__all__ = [
    "RoleInfo",
    "RoleWithPermissions",
    "PermissionInfo",
    "RolePermissionMapping",
    "PermissionsResponse",
    "MyRoleResponse",
]

