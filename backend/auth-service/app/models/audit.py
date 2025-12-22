"""Audit event model - stores audit logs from WorkOS and custom events."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


class AuditEvent(BaseModel, table=True):
    """
    Audit event model - stores audit logs from WorkOS and custom events.

    Events can be synced from WorkOS or created locally for custom tracking.
    """

    __tablename__ = "audit_events"
    __table_args__ = (
        # Composite index for org/user audit queries with time sorting
        Index("ix_audit_events_org_user_time", "organization_id", "user_id", "created_at"),
        # Composite index for action-based queries with time sorting
        Index("ix_audit_events_action_time", "action", "created_at"),
    )

    # id, created_at, updated_at inherited from BaseModel
    organization_id: str = Field(max_length=255, index=True)
    user_id: str = Field(max_length=255, index=True)
    user_email: str = Field(max_length=255)
    action: str = Field(max_length=255, index=True)
    target_type: str | None = Field(max_length=255, default=None)
    target_id: str | None = Field(max_length=255, default=None)
    target_name: str | None = Field(max_length=255, default=None)
    ip_address: str | None = Field(max_length=45, default=None)
    user_agent: str | None = None
    source: str = Field(max_length=50, default="workos")  # "workos" or "custom"
    event_metadata: dict = Field(default_factory=dict, sa_column=Column(JSONB))


class AuditEventCreate(SQLModel):
    """Schema for creating an audit event."""

    organization_id: str
    user_id: str
    user_email: str
    action: str
    target_type: str | None = None
    target_id: str | None = None
    target_name: str | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    event_metadata: dict = {}
    source: str = "custom"


class AuditEventRead(SQLModel):
    """Schema for reading audit event data."""

    id: str
    organization_id: str
    user_id: str
    user_email: str
    action: str
    target_type: str | None = None
    target_id: str | None = None
    target_name: str | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    source: str
    event_metadata: dict

