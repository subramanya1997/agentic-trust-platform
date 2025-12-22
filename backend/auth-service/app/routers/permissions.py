"""Permission information routes - fetches roles from WorkOS."""

import logging

from fastapi import APIRouter, Depends

from app.core import workos_client
from app.dependencies import get_current_role, get_session
from app.schemas.permissions import (
    MyRoleResponse,
    PermissionInfo,
    PermissionsResponse,
    RoleInfo,
    RolePermissionMapping,
    RoleWithPermissions,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# Define all available permissions with their categories
PERMISSION_DEFINITIONS = {
    # Agents
    "agents:create": {"name": "Create Agents", "description": "Create new AI agents", "category": "Agents"},
    "agents:read": {"name": "View Agents", "description": "View agent configurations and details", "category": "Agents"},
    "agents:update": {"name": "Update Agents", "description": "Modify existing agent configurations", "category": "Agents"},
    "agents:delete": {"name": "Delete Agents", "description": "Remove agents from the system", "category": "Agents"},
    "agents:execute": {"name": "Execute Agents", "description": "Run and trigger agent executions", "category": "Agents"},
    # Integrations
    "integrations:create": {"name": "Create Integrations", "description": "Connect new external services", "category": "Integrations"},
    "integrations:read": {"name": "View Integrations", "description": "View connected integrations", "category": "Integrations"},
    "integrations:update": {"name": "Update Integrations", "description": "Modify integration settings", "category": "Integrations"},
    "integrations:delete": {"name": "Delete Integrations", "description": "Disconnect external services", "category": "Integrations"},
    # Team
    "team:invite": {"name": "Invite Members", "description": "Send invitations to new team members", "category": "Team"},
    "team:manage": {"name": "Manage Members", "description": "Update team member roles", "category": "Team"},
    "team:remove": {"name": "Remove Members", "description": "Remove members from the organization", "category": "Team"},
    # Organization
    "organization:read": {"name": "View Organization", "description": "View organization settings", "category": "Organization"},
    "organization:update": {"name": "Update Organization", "description": "Modify organization settings", "category": "Organization"},
    # Billing
    "billing:read": {"name": "View Billing", "description": "View billing information and invoices", "category": "Billing"},
    "billing:update": {"name": "Manage Billing", "description": "Update payment methods and subscriptions", "category": "Billing"},
    # API Keys
    "api_keys:create": {"name": "Create API Keys", "description": "Generate new API keys", "category": "API Keys"},
    "api_keys:read": {"name": "View API Keys", "description": "View existing API keys", "category": "API Keys"},
    "api_keys:delete": {"name": "Revoke API Keys", "description": "Revoke existing API keys", "category": "API Keys"},
    # MCP
    "mcp:read": {"name": "View MCP Servers", "description": "View MCP server registry", "category": "MCP"},
    "mcp:manage": {"name": "Manage MCP Servers", "description": "Add and configure MCP servers", "category": "MCP"},
}


@router.get("/roles", response_model=list[RoleInfo])
async def list_roles():
    """List all available roles from WorkOS."""
    try:
        roles = workos_client.list_roles()
        return [
            RoleInfo(
                slug=role.slug if hasattr(role, "slug") else str(role),
                name=role.name if hasattr(role, "name") else str(role),
                description=role.description if hasattr(role, "description") else None,
            )
            for role in (roles.data if hasattr(roles, "data") else roles)
        ]
    except Exception as e:
        # If WorkOS doesn't have roles configured, return default roles
        return [
            RoleInfo(slug="admin", name="Admin", description="Full access to all features"),
            RoleInfo(
                slug="member",
                name="Member",
                description="Can create and manage agents, integrations",
            ),
            RoleInfo(slug="viewer", name="Viewer", description="Read-only access"),
        ]


@router.get("/organization-roles", response_model=PermissionsResponse)
async def get_organization_roles_with_permissions(session=Depends(get_session)):
    """
    Get roles with their permissions for the current organization.
    
    Returns roles from WorkOS along with a permission matrix.
    """
    organization_id = session.organization_id
    
    if not organization_id:
        # Return default structure if no org selected
        return PermissionsResponse(
            roles=[],
            permissions=[],
            rolePermissions=[],
        )
    
    # Fetch roles from WorkOS
    roles_response = workos_client.list_organization_roles(organization_id)
    roles_data = roles_response.get("data", [])
    
    # Build roles list
    roles = []
    all_permissions_set = set()
    role_permissions = []
    
    for role in roles_data:
        role_id = role.get("id", role.get("slug", ""))
        role_slug = role.get("slug", "")
        role_name = role.get("name", role_slug)
        role_desc = role.get("description")
        role_perms = role.get("permissions", [])
        role_type = role.get("type", "EnvironmentRole")
        
        roles.append(RoleWithPermissions(
            id=role_id,
            slug=role_slug,
            name=role_name,
            description=role_desc,
            permissions=role_perms,
            type=role_type,
        ))
        
        role_permissions.append(RolePermissionMapping(
            roleId=role_slug,
            roleName=role_name,
            permissions=role_perms,
        ))
        
        all_permissions_set.update(role_perms)
    
    # Build permissions list with definitions
    permissions = []
    for perm_id in sorted(all_permissions_set):
        if perm_id in PERMISSION_DEFINITIONS:
            perm_def = PERMISSION_DEFINITIONS[perm_id]
            permissions.append(PermissionInfo(
                id=perm_id,
                name=perm_def["name"],
                description=perm_def["description"],
                category=perm_def["category"],
            ))
        else:
            # Handle unknown permissions
            category = perm_id.split(":")[0].capitalize() if ":" in perm_id else "Other"
            permissions.append(PermissionInfo(
                id=perm_id,
                name=perm_id.replace(":", " ").replace("_", " ").title(),
                description=f"Permission: {perm_id}",
                category=category,
            ))
    
    return PermissionsResponse(
        roles=roles,
        permissions=permissions,
        rolePermissions=role_permissions,
    )


@router.get("/me", response_model=MyRoleResponse)
async def get_my_role(session=Depends(get_session)):
    """Get current user's role in the selected organization."""
    return MyRoleResponse(
        role=session.role,
        organization_id=session.organization_id,
    )

