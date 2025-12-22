"""Database models.

This package exports all SQLModel database models and related schemas.
Models represent database tables, while schemas are used for API requests
and responses.

Models:
    - BaseModel: Base class with id and timestamps
    - User: User model synced from WorkOS
    - Organization: Organization model synced from WorkOS
    - AuditEvent: Audit log event model
    - Permission: Permission model for RBAC

Schemas:
    - UserCreate, UserRead: User request/response schemas
    - OrganizationCreate, OrganizationRead: Organization schemas
    - AuditEventCreate, AuditEventRead: Audit event schemas
    - PermissionCreate, PermissionRead: Permission schemas

Usage:
    from app.models import User, Organization, UserRead
    
    # In route handlers
    @router.get("/users/me", response_model=UserRead)
    async def get_me(user: User = Depends(get_current_user)):
        return user
"""

from app.models.audit import AuditEvent, AuditEventCreate, AuditEventRead
from app.models.base import BaseModel
from app.models.organization import Organization, OrganizationCreate, OrganizationRead
from app.models.permission import Permission, PermissionCreate, PermissionRead
from app.models.user import User, UserCreate, UserRead

__all__ = [
    "BaseModel",
    "User",
    "UserCreate",
    "UserRead",
    "Organization",
    "OrganizationCreate",
    "OrganizationRead",
    "Permission",
    "PermissionCreate",
    "PermissionRead",
    "AuditEvent",
    "AuditEventCreate",
    "AuditEventRead",
]

