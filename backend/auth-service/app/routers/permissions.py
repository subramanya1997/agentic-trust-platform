"""Permission information routes - fetches roles from WorkOS.

This module provides endpoints for querying role and permission information.
It integrates with WorkOS to fetch role definitions and builds a comprehensive
permission matrix for the frontend.

Endpoints:
    - GET /permissions/roles: List all available roles
    - GET /permissions/organization-roles: Get roles with permissions for current org
    - GET /permissions/me: Get current user's role

Key Features:
    - Fetches roles from WorkOS API
    - Builds permission matrix from role definitions
    - Provides fallback roles if WorkOS doesn't have roles configured
    - Maps permissions to human-readable names and categories

Permission Categories:
    - Agents: Agent creation and management
    - Integrations: External service integrations
    - Team: Team member management
    - Organization: Organization settings
    - Billing: Billing and subscription management
    - API Keys: API key management
    - MCP: MCP server management

Usage:
    These endpoints are used by the frontend to:
    - Display available roles in UI
    - Show permission matrix for role management
    - Check user's current role and permissions
"""

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
    """
    List all available roles from WorkOS.
    
    This endpoint fetches all available roles from WorkOS and returns them
    in a simplified format. If WorkOS doesn't have roles configured, it
    returns default roles (admin, member, viewer).
    
    Authentication:
        Not required (public endpoint)
    
    Returns:
        list[RoleInfo]: List of available roles with slug, name, and description
        
    Example:
        >>> GET /permissions/roles
        [
            {
                "slug": "admin",
                "name": "Admin",
                "description": "Full access to all features"
            },
            {
                "slug": "member",
                "name": "Member",
                "description": "Can create and manage agents, integrations"
            },
            {
                "slug": "viewer",
                "name": "Viewer",
                "description": "Read-only access"
            }
        ]
    
    Note:
        If WorkOS API fails or doesn't have roles configured, returns
        default roles to ensure the frontend always has role information.
    """
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
    
    This endpoint provides a comprehensive view of all roles, permissions,
    and their relationships for the current organization. It's used by the
    frontend to build permission management UI.
    
    Process:
        1. Fetches roles from WorkOS for the current organization
        2. Extracts permissions from each role
        3. Builds permission definitions with human-readable names
        4. Creates role-permission mappings
        5. Returns complete permission structure
    
    Authentication:
        Required (session cookie)
    
    Headers:
        X-Organization-ID: Current organization ID
        
    Returns:
        PermissionsResponse: Complete permission structure containing:
            - roles: List of roles with their permissions
            - permissions: List of all available permissions
            - rolePermissions: Mappings of roles to permissions
            
    Example:
        >>> GET /permissions/organization-roles
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
                    "description": "Create new AI agents",
                    "category": "Agents"
                }
            ],
            "rolePermissions": [
                {
                    "roleId": "admin",
                    "roleName": "Admin",
                    "permissions": ["*"]
                }
            ]
        }
    
    Note:
        If no organization is selected (missing X-Organization-ID header),
        returns empty structure. Permissions are enriched with human-readable
        names from PERMISSION_DEFINITIONS dictionary.
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
    """
    Get current user's role in the selected organization.
    
    This endpoint returns the authenticated user's role in the current
    organization context. It's used by the frontend to determine what
    actions the user can perform.
    
    Authentication:
        Required (session cookie)
    
    Headers:
        X-Organization-ID: Current organization ID (optional)
        
    Returns:
        MyRoleResponse: User's role and organization ID
        
    Example:
        >>> GET /permissions/me
        {
            "role": "admin",
            "organization_id": "org_01ABC123"
        }
    
    Note:
        If no organization is selected, organization_id will be None.
        Role will be None if user is not a member of the organization.
    """
    return MyRoleResponse(
        role=session.role,
        organization_id=session.organization_id,
    )

