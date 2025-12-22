"""API request/response schemas.

This package exports all Pydantic schemas used for API request validation
and response serialization. Schemas are organized by domain (auth, organization,
team, permissions).

Exports:
    - Auth schemas: OAuth and authentication responses
    - Organization schemas: Organization CRUD requests/responses
    - Team schemas: Team member management schemas
    - Permission schemas: Role and permission information schemas

Usage:
    from app.schemas import UserRead, OrganizationCreateRequest
    
    @router.post("/organizations", response_model=OrganizationRead)
    async def create_org(data: OrganizationCreateRequest):
        ...
"""

from app.schemas.auth import (
    AuthCallbackResponse,
    AuthURLResponse,
    OrganizationMembershipResponse,
)
from app.schemas.organization import (
    OrganizationCreateRequest,
    OrganizationUpdateRequest,
)
from app.schemas.permissions import (
    MyRoleResponse,
    PermissionInfo,
    PermissionsResponse,
    RoleInfo,
    RolePermissionMapping,
    RoleWithPermissions,
)
from app.schemas.team import (
    InviteMemberRequest,
    TeamMemberResponse,
    UpdateMemberRoleRequest,
)

__all__ = [
    # Auth
    "AuthURLResponse",
    "AuthCallbackResponse",
    "OrganizationMembershipResponse",
    # Organization
    "OrganizationCreateRequest",
    "OrganizationUpdateRequest",
    # Team
    "TeamMemberResponse",
    "InviteMemberRequest",
    "UpdateMemberRoleRequest",
    # Permissions
    "RoleInfo",
    "RoleWithPermissions",
    "PermissionInfo",
    "RolePermissionMapping",
    "PermissionsResponse",
    "MyRoleResponse",
]
