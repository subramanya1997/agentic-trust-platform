"""API request/response schemas."""

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
