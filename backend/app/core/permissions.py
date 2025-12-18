"""Role-Based Access Control (RBAC) system."""

from enum import Enum

from fastapi import Depends, HTTPException, status


class Permission(str, Enum):
    """All available permissions in the system."""

    # Agents
    AGENTS_VIEW = "agents.view"
    AGENTS_CREATE = "agents.create"
    AGENTS_EDIT = "agents.edit"
    AGENTS_DELETE = "agents.delete"
    AGENTS_RUN = "agents.run"

    # Integrations
    INTEGRATIONS_VIEW = "integrations.view"
    INTEGRATIONS_ADD = "integrations.add"
    INTEGRATIONS_CONFIGURE = "integrations.configure"
    INTEGRATIONS_REMOVE = "integrations.remove"

    # Executions
    EXECUTIONS_VIEW = "executions.view"
    EXECUTIONS_CANCEL = "executions.cancel"
    EXECUTIONS_RETRY = "executions.retry"

    # MCP
    MCP_VIEW = "mcp.view"
    MCP_CREATE = "mcp.create"
    MCP_EDIT = "mcp.edit"
    MCP_DELETE = "mcp.delete"

    # Webhooks
    WEBHOOKS_VIEW = "webhooks.view"
    WEBHOOKS_MANAGE = "webhooks.manage"

    # Team
    TEAM_VIEW = "team.view"
    TEAM_INVITE = "team.invite"
    TEAM_MANAGE = "team.manage"
    TEAM_REMOVE = "team.remove"

    # API Keys
    APIKEYS_VIEW = "apikeys.view"
    APIKEYS_CREATE = "apikeys.create"
    APIKEYS_REVOKE = "apikeys.revoke"

    # Analytics
    ANALYTICS_VIEW = "analytics.view"
    ANALYTICS_EXPORT = "analytics.export"

    # Settings
    SETTINGS_VIEW = "settings.view"
    SETTINGS_EDIT = "settings.edit"
    SETTINGS_BILLING = "settings.billing"

    # Audit
    AUDIT_VIEW = "audit.view"
    AUDIT_EXPORT = "audit.export"


# Role to permissions mapping
ROLE_PERMISSIONS: dict[str, set[Permission]] = {
    "admin": set(Permission),  # All permissions
    "member": {
        # Agents - full access
        Permission.AGENTS_VIEW,
        Permission.AGENTS_CREATE,
        Permission.AGENTS_EDIT,
        Permission.AGENTS_DELETE,
        Permission.AGENTS_RUN,
        # Integrations - full access
        Permission.INTEGRATIONS_VIEW,
        Permission.INTEGRATIONS_ADD,
        Permission.INTEGRATIONS_CONFIGURE,
        Permission.INTEGRATIONS_REMOVE,
        # Executions - full access
        Permission.EXECUTIONS_VIEW,
        Permission.EXECUTIONS_CANCEL,
        Permission.EXECUTIONS_RETRY,
        # MCP - full access
        Permission.MCP_VIEW,
        Permission.MCP_CREATE,
        Permission.MCP_EDIT,
        Permission.MCP_DELETE,
        # Webhooks - full access
        Permission.WEBHOOKS_VIEW,
        Permission.WEBHOOKS_MANAGE,
        # Team - view only
        Permission.TEAM_VIEW,
        # API Keys - view and create
        Permission.APIKEYS_VIEW,
        Permission.APIKEYS_CREATE,
        # Analytics - view only
        Permission.ANALYTICS_VIEW,
        # Settings - view only
        Permission.SETTINGS_VIEW,
    },
    "guest": {
        Permission.AGENTS_VIEW,
        Permission.INTEGRATIONS_VIEW,
        Permission.EXECUTIONS_VIEW,
        Permission.MCP_VIEW,
        Permission.WEBHOOKS_VIEW,
        Permission.TEAM_VIEW,
        Permission.ANALYTICS_VIEW,
        Permission.SETTINGS_VIEW,
    },
}


def has_permission(role: str, permission: Permission) -> bool:
    """Check if a role has a specific permission."""
    role_perms = ROLE_PERMISSIONS.get(role.lower(), set())
    return permission in role_perms


def get_role_permissions(role: str) -> list[str]:
    """Get list of permission strings for a role."""
    perms = ROLE_PERMISSIONS.get(role.lower(), set())
    return [p.value for p in perms]


def require_permission(permission: Permission):
    """FastAPI dependency to require a specific permission."""
    from app.dependencies import get_current_role

    async def permission_checker(role: str = Depends(get_current_role)):
        if not has_permission(role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permission: {permission.value}",
            )
        return role

    return Depends(permission_checker)

