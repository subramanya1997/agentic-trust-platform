"""Permission and role-related request and response schemas.

This module defines Pydantic schemas for role and permission API responses.
These schemas represent WorkOS roles and permissions, and the current user's
role in an organization.

Schemas:
    - RoleInfo: Basic role information
    - RoleWithPermissions: Role with associated permissions
    - PermissionInfo: Permission details
    - RolePermissionMapping: Mapping of roles to permissions
    - PermissionsResponse: Complete permissions structure
    - MyRoleResponse: Current user's role

Usage:
    @router.get("/permissions/roles", response_model=list[RoleWithPermissions])
    async def list_roles(...):
        ...
"""

from pydantic import BaseModel


class RoleInfo(BaseModel):
    """
    Basic role information from WorkOS.
    
    This schema represents a role without its permissions. Used for simple
    role listings.
    
    Attributes:
        slug (str): Role slug ("admin", "member", "viewer")
        name (str): Human-readable role name ("Admin", "Member", "Viewer")
        description (str | None): Role description (optional)
        
    Example:
        {
            "slug": "admin",
            "name": "Admin",
            "description": "Full access to all features"
        }
    """

    slug: str
    name: str
    description: str | None = None


class RoleWithPermissions(BaseModel):
    """
    Role information with associated permissions from WorkOS.
    
    This schema represents a role with its full permission set. Used when
    displaying role details and permission management.
    
    Attributes:
        id (str): Role ID (WorkOS role ID)
        slug (str): Role slug ("admin", "member", "viewer")
        name (str): Human-readable role name
        description (str | None): Role description
        permissions (list[str]): List of permission slugs (e.g., ["agents:create", "agents:read"])
        type (str): Role type (default: "EnvironmentRole")
        
    Example:
        {
            "id": "role_01ABC123",
            "slug": "admin",
            "name": "Admin",
            "description": "Full access",
            "permissions": ["*"],
            "type": "EnvironmentRole"
        }
    """

    id: str
    slug: str
    name: str
    description: str | None = None
    permissions: list[str] = []
    type: str = "EnvironmentRole"


class PermissionInfo(BaseModel):
    """
    Permission information derived from roles.
    
    This schema represents a single permission with its metadata. Used for
    displaying available permissions and their descriptions.
    
    Attributes:
        id (str): Permission slug (e.g., "agents:create")
        name (str): Human-readable permission name
        description (str): Permission description
        category (str): Permission category (e.g., "agents", "api_keys")
        
    Example:
        {
            "id": "agents:create",
            "name": "Create Agents",
            "description": "Allows creating new AI agents",
            "category": "agents"
        }
    """

    id: str
    name: str
    description: str
    category: str


class RolePermissionMapping(BaseModel):
    """
    Mapping of role to its permissions.
    
    This schema represents the relationship between a role and its permissions.
    Used for displaying which permissions each role has.
    
    Attributes:
        roleId (str): Role ID
        roleName (str): Human-readable role name
        permissions (list[str]): List of permission slugs for this role
        
    Example:
        {
            "roleId": "role_01ABC123",
            "roleName": "Admin",
            "permissions": ["*"]
        }
    """

    roleId: str
    roleName: str
    permissions: list[str]


class PermissionsResponse(BaseModel):
    """
    Full permissions response for the organization.
    
    This schema provides a complete view of all roles, permissions, and their
    relationships. Used by the frontend for permission management UI.
    
    Attributes:
        roles (list[RoleWithPermissions]): All available roles with permissions
        permissions (list[PermissionInfo]): All available permissions
        rolePermissions (list[RolePermissionMapping]): Mappings of roles to permissions
        
    Example:
        {
            "roles": [
                {
                    "id": "role_01ABC123",
                    "slug": "admin",
                    "name": "Admin",
                    "permissions": ["*"]
                }
            ],
            "permissions": [
                {
                    "id": "agents:create",
                    "name": "Create Agents",
                    "category": "agents"
                }
            ],
            "rolePermissions": [
                {
                    "roleId": "role_01ABC123",
                    "roleName": "Admin",
                    "permissions": ["*"]
                }
            ]
        }
    """

    roles: list[RoleWithPermissions]
    permissions: list[PermissionInfo]
    rolePermissions: list[RolePermissionMapping]


class MyRoleResponse(BaseModel):
    """
    Current user's role in organization.
    
    This schema represents the authenticated user's role in the current
    organization context. Used for displaying role information to the user.
    
    Attributes:
        role (str | None): User's role slug ("admin", "member", "viewer")
        organization_id (str | None): Current organization ID
        
    Example:
        {
            "role": "admin",
            "organization_id": "org_01ABC123"
        }
    """

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

