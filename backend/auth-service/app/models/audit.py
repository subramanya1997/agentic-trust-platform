"""Audit event model - stores audit logs from WorkOS and custom events.

This module defines the AuditEvent model for storing audit trail information.
Audit events can be synced from WorkOS or created locally for custom tracking.

Key Features:
- Comprehensive audit trail for compliance and security
- Support for both WorkOS-synced and custom events
- Flexible metadata storage (JSONB)
- Optimized indexes for common query patterns
- IP address and user agent tracking

Database Schema:
    audit_events table:
    - id VARCHAR(255) PRIMARY KEY (UUID)
    - organization_id VARCHAR(255) NOT NULL INDEXED
    - user_id VARCHAR(255) NOT NULL INDEXED
    - user_email VARCHAR(255) NOT NULL
    - action VARCHAR(255) NOT NULL INDEXED
    - target_type VARCHAR(255) NULLABLE
    - target_id VARCHAR(255) NULLABLE
    - target_name VARCHAR(255) NULLABLE
    - ip_address VARCHAR(45) NULLABLE (IPv6 support)
    - user_agent TEXT NULLABLE
    - source VARCHAR(50) DEFAULT 'workos'
    - event_metadata JSONB DEFAULT '{}'
    - created_at TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    
    Indexes:
    - Primary: id
    - Single: organization_id, user_id, action
    - Composite: (organization_id, user_id, created_at) - for org/user audit queries
    - Composite: (action, created_at) - for action-based queries

Usage:
    from app.models import AuditEvent
    from app.database import get_db
    
    async def log_event(org_id: str, user_id: str, action: str):
        async with get_db() as db:
            event = AuditEvent(
                organization_id=org_id,
                user_id=user_id,
                user_email="user@example.com",
                action=action,
                source="custom"
            )
            db.add(event)
            await db.commit()
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


class AuditEvent(BaseModel, table=True):
    """
    Audit event model - stores audit logs from WorkOS and custom events.

    This model provides a comprehensive audit trail for compliance, security,
    and debugging purposes. Events can be synced from WorkOS (automatic events
    like logins, role changes) or created locally for custom tracking (e.g.,
    agent creation, API key generation).

    Key Features:
    - Tracks who did what, when, and where
    - Supports both WorkOS-synced and custom events
    - Flexible metadata storage for additional context
    - Optimized indexes for common query patterns
    - IP address and user agent tracking for security

    Database Table:
        Table name: "audit_events"
        Schema: auth (set via database configuration)

    Indexes:
        - Primary: id (UUID)
        - Single: organization_id, user_id, action (for filtering)
        - Composite: (organization_id, user_id, created_at) - for org/user queries
        - Composite: (action, created_at) - for action-based queries

    Attributes:
        id (str): UUID primary key (auto-generated)
        organization_id (str): Organization ID where event occurred (indexed)
        user_id (str): User ID who performed the action (indexed)
        user_email (str): User's email (denormalized for easier querying)
        action (str): Action performed (e.g., "user.login", "agent.create") (indexed)
        target_type (str | None): Type of resource affected (e.g., "agent", "api_key")
        target_id (str | None): ID of resource affected
        target_name (str | None): Name of resource affected (for readability)
        ip_address (str | None): IP address of the request (supports IPv6)
        user_agent (str | None): User agent string from request
        source (str): Source of event - "workos" (synced) or "custom" (local)
        event_metadata (dict): Additional event data (JSONB, default: {})
        created_at (datetime): When event occurred
        updated_at (datetime): When event was last updated

    Common Actions:
        - "user.login": User logged in
        - "user.logout": User logged out
        - "organization.create": Organization created
        - "organization.update": Organization updated
        - "team.member.invite": Team member invited
        - "team.member.remove": Team member removed
        - "agent.create": Agent created
        - "agent.update": Agent updated
        - "agent.delete": Agent deleted
        - "api_key.create": API key created
        - "api_key.revoke": API key revoked

    Example:
        >>> event = AuditEvent(
        ...     organization_id="org_01ABC123",
        ...     user_id="user_01XYZ789",
        ...     user_email="john@example.com",
        ...     action="agent.create",
        ...     target_type="agent",
        ...     target_id="agent_01DEF456",
        ...     target_name="Customer Support Bot",
        ...     ip_address="192.168.1.1",
        ...     source="custom",
        ...     event_metadata={"agent_type": "chatbot", "model": "gpt-4"}
        ... )
    """

    __tablename__ = "audit_events"
    __table_args__ = (
        # Composite index for org/user audit queries with time sorting
        # Used when querying audit events for a specific org/user combination
        # with time-based filtering (e.g., "recent events for user X in org Y")
        Index("ix_audit_events_org_user_time", "organization_id", "user_id", "created_at"),
        # Composite index for action-based queries with time sorting
        # Used when querying events by action type with time filtering
        # (e.g., "all login events in the last 24 hours")
        Index("ix_audit_events_action_time", "action", "created_at"),
    )

    # id, created_at, updated_at inherited from BaseModel
    organization_id: str = Field(
        max_length=255,
        index=True,
        description="Organization ID where the event occurred (indexed for filtering)",
    )
    user_id: str = Field(
        max_length=255,
        index=True,
        description="User ID who performed the action (indexed for filtering)",
    )
    user_email: str = Field(
        max_length=255,
        description="User's email address (denormalized for easier querying without joins)",
    )
    action: str = Field(
        max_length=255,
        index=True,
        description="Action performed (e.g., 'user.login', 'agent.create') (indexed)",
    )
    target_type: str | None = Field(
        max_length=255,
        default=None,
        description="Type of resource affected (e.g., 'agent', 'api_key', 'organization')",
    )
    target_id: str | None = Field(
        max_length=255,
        default=None,
        description="ID of the resource affected by the action",
    )
    target_name: str | None = Field(
        max_length=255,
        default=None,
        description="Name of the resource (for human-readable audit logs)",
    )
    ip_address: str | None = Field(
        max_length=45,
        default=None,
        description="IP address of the request (supports IPv6, max 45 characters)",
    )
    user_agent: str | None = Field(
        default=None,
        description="User agent string from the HTTP request",
    )
    source: str = Field(
        max_length=50,
        default="workos",
        description="Source of event: 'workos' (synced from WorkOS) or 'custom' (created locally)",
    )
    event_metadata: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Additional event data stored as JSON (e.g., request details, error messages)",
    )


class AuditEventCreate(SQLModel):
    """Schema for creating an audit event.
    
    This schema is used when creating custom audit events (not synced from WorkOS).
    It contains all the fields needed to create a new audit event record.
    
    Attributes:
        organization_id (str): Organization ID where event occurred
        user_id (str): User ID who performed the action
        user_email (str): User's email address
        action (str): Action performed (e.g., "agent.create", "api_key.revoke")
        target_type (str | None): Type of resource affected (optional)
        target_id (str | None): ID of resource affected (optional)
        target_name (str | None): Name of resource affected (optional)
        ip_address (str | None): IP address of the request (optional)
        user_agent (str | None): User agent string (optional)
        event_metadata (dict): Additional event data (default: {})
        source (str): Source of event - "custom" for local events (default: "custom")
    
    Usage:
        >>> event_data = AuditEventCreate(
        ...     organization_id="org_01ABC123",
        ...     user_id="user_01XYZ789",
        ...     user_email="john@example.com",
        ...     action="agent.create",
        ...     target_type="agent",
        ...     target_id="agent_01DEF456",
        ...     ip_address="192.168.1.1",
        ...     source="custom"
        ... )
    """

    organization_id: str = Field(description="Organization ID where event occurred")
    user_id: str = Field(description="User ID who performed the action")
    user_email: str = Field(description="User's email address")
    action: str = Field(description="Action performed (e.g., 'agent.create', 'api_key.revoke')")
    target_type: str | None = Field(default=None, description="Type of resource affected")
    target_id: str | None = Field(default=None, description="ID of resource affected")
    target_name: str | None = Field(default=None, description="Name of resource affected")
    ip_address: str | None = Field(default=None, description="IP address of the request")
    user_agent: str | None = Field(default=None, description="User agent string")
    event_metadata: dict = Field(default_factory=dict, description="Additional event data")
    source: str = Field(
        default="custom",
        description="Source of event: 'workos' or 'custom'",
    )


class AuditEventRead(SQLModel):
    """Schema for reading audit event data in API responses.
    
    This schema defines what audit event data is exposed in API responses.
    It includes all fields from the model except internal tracking fields.
    
    Attributes:
        id (str): Event ID (UUID)
        organization_id (str): Organization ID where event occurred
        user_id (str): User ID who performed the action
        user_email (str): User's email address
        action (str): Action performed
        target_type (str | None): Type of resource affected
        target_id (str | None): ID of resource affected
        target_name (str | None): Name of resource affected
        ip_address (str | None): IP address of the request
        user_agent (str | None): User agent string
        source (str): Source of event ("workos" or "custom")
        event_metadata (dict): Additional event data
    
    Usage:
        Used as response_model in FastAPI route handlers:
        
        @router.get("/audit/events", response_model=list[AuditEventRead])
        async def list_audit_events(...):
            return events
    """

    id: str = Field(description="Event ID (UUID)")
    organization_id: str = Field(description="Organization ID where event occurred")
    user_id: str = Field(description="User ID who performed the action")
    user_email: str = Field(description="User's email address")
    action: str = Field(description="Action performed")
    target_type: str | None = Field(default=None, description="Type of resource affected")
    target_id: str | None = Field(default=None, description="ID of resource affected")
    target_name: str | None = Field(default=None, description="Name of resource affected")
    ip_address: str | None = Field(default=None, description="IP address of the request")
    user_agent: str | None = Field(default=None, description="User agent string")
    source: str = Field(description="Source of event: 'workos' or 'custom'")
    event_metadata: dict = Field(description="Additional event data")

