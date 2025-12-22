"""Permission model for database-backed permission management."""

from datetime import datetime

from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


class PermissionBase(BaseModel):
    """Base permission fields."""

    name: str = Field(max_length=255, unique=True, index=True)
    description: str = Field(max_length=500)
    category: str = Field(max_length=100, index=True)


class Permission(PermissionBase, table=True):
    """
    Permission model - stores available permissions for RBAC.
    
    Permissions are seeded via migration and can be managed via admin API.
    """

    __tablename__ = "permissions"

    # Override id for custom format (e.g., "agents:create")
    id: str = Field(primary_key=True, max_length=255)
    # created_at and updated_at inherited from BaseModel


class PermissionRead(PermissionBase):
    """Schema for reading permission data."""

    id: str
    created_at: datetime
    updated_at: datetime


class PermissionCreate(SQLModel):
    """Schema for creating a permission."""

    id: str
    name: str
    description: str
    category: str

