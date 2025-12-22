"""Permission model for database-backed permission management.

This module defines the Permission model for storing fine-grained permissions
used in role-based access control (RBAC). Permissions are typically seeded
via database migrations and can be managed via admin APIs.

Key Features:
- Fine-grained permission control (e.g., "agents:create", "api_keys:read")
- Category-based organization (e.g., "agents", "api_keys", "organizations")
- Human-readable names and descriptions
- Database-backed for dynamic permission management

Database Schema:
    permissions table:
    - id VARCHAR(255) PRIMARY KEY (permission slug, e.g., "agents:create")
    - name VARCHAR(255) UNIQUE NOT NULL INDEXED
    - description VARCHAR(500) NOT NULL
    - category VARCHAR(100) NOT NULL INDEXED
    - created_at TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at TIMESTAMP WITH TIME ZONE NOT NULL

Permission Format:
    Permissions follow the format: "{category}:{action}"
    Examples:
    - "agents:create" - Create agents
    - "agents:read" - Read/view agents
    - "agents:update" - Update agents
    - "agents:delete" - Delete agents
    - "api_keys:create" - Create API keys
    - "api_keys:revoke" - Revoke API keys
    - "*" - Wildcard permission (allows everything)

Usage:
    from app.models import Permission
    from app.database import get_db
    
    async def check_permission(user_role: str, permission: str):
        # Check if role has permission
        # Implementation depends on role-permission mapping
        ...
"""

from datetime import datetime

from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


class PermissionBase(BaseModel):
    """Base permission fields shared across Permission model and schemas.
    
    Contains the common fields that identify and describe a permission.
    
    Attributes:
        name (str): Human-readable permission name (unique, indexed)
        description (str): Detailed description of what the permission allows
        category (str): Category/namespace for the permission (indexed)
    """

    name: str = Field(
        max_length=255,
        unique=True,
        index=True,
        description="Human-readable permission name (unique, indexed)",
    )
    description: str = Field(
        max_length=500,
        description="Detailed description of what the permission allows",
    )
    category: str = Field(
        max_length=100,
        index=True,
        description="Category/namespace for the permission (e.g., 'agents', 'api_keys')",
    )


class Permission(PermissionBase, table=True):
    """
    Permission model - stores available permissions for RBAC.
    
    This model stores fine-grained permissions that can be assigned to roles.
    Permissions follow a hierarchical structure: category:action (e.g., "agents:create").
    
    Key Features:
    - Fine-grained control over user actions
    - Category-based organization for easier management
    - Database-backed for dynamic permission updates
    - Typically seeded via migrations
    
    Database Table:
        Table name: "permissions"
        Schema: auth (set via database configuration)
    
    Permission ID Format:
        Permissions use a slug format: "{category}:{action}"
        Examples:
        - "agents:create" - Permission to create agents
        - "agents:read" - Permission to read/view agents
        - "agents:update" - Permission to update agents
        - "agents:delete" - Permission to delete agents
        - "api_keys:create" - Permission to create API keys
        - "api_keys:revoke" - Permission to revoke API keys
        - "*" - Wildcard permission (allows all actions)
    
    Attributes:
        id (str): Permission slug (e.g., "agents:create"), primary key
        name (str): Human-readable name (e.g., "Create Agents") (unique, indexed)
        description (str): Detailed description (max 500 characters)
        category (str): Permission category (e.g., "agents", "api_keys") (indexed)
        created_at (datetime): When permission was created
        updated_at (datetime): When permission was last updated
    
    Example:
        >>> permission = Permission(
        ...     id="agents:create",
        ...     name="Create Agents",
        ...     description="Allows creating new AI agents",
        ...     category="agents"
        ... )
    """

    __tablename__ = "permissions"

    # Override id for custom format (e.g., "agents:create")
    # This allows permissions to have meaningful IDs that match their purpose
    id: str = Field(
        primary_key=True,
        max_length=255,
        description="Permission slug in format 'category:action' (e.g., 'agents:create')",
    )
    # created_at and updated_at inherited from BaseModel


class PermissionRead(PermissionBase):
    """Schema for reading permission data in API responses.
    
    This schema defines what permission data is exposed in API responses.
    It includes all fields from the model.
    
    Attributes:
        id (str): Permission slug (e.g., "agents:create")
        name (str): Human-readable permission name
        description (str): Detailed description
        category (str): Permission category
        created_at (datetime): When permission was created
        updated_at (datetime): When permission was last updated
    
    Usage:
        Used as response_model in FastAPI route handlers:
        
        @router.get("/permissions", response_model=list[PermissionRead])
        async def list_permissions(...):
            return permissions
    """

    id: str = Field(description="Permission slug")
    created_at: datetime = Field(description="When permission was created")
    updated_at: datetime = Field(description="When permission was last updated")


class PermissionCreate(SQLModel):
    """Schema for creating a permission.
    
    This schema is used when creating new permissions via admin API.
    It contains all the fields needed to create a new permission record.
    
    Attributes:
        id (str): Permission slug (e.g., "agents:create")
        name (str): Human-readable permission name
        description (str): Detailed description of what the permission allows
        category (str): Permission category (e.g., "agents", "api_keys")
    
    Usage:
        >>> permission_data = PermissionCreate(
        ...     id="agents:create",
        ...     name="Create Agents",
        ...     description="Allows creating new AI agents",
        ...     category="agents"
        ... )
    """

    id: str = Field(description="Permission slug in format 'category:action'")
    name: str = Field(description="Human-readable permission name")
    description: str = Field(description="Detailed description of what the permission allows")
    category: str = Field(description="Permission category (e.g., 'agents', 'api_keys')")

