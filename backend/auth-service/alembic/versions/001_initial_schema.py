"""Initial database schema with users, organizations, audit_events, and permissions.

Revision ID: 001_initial_schema
Revises: 
Create Date: 2025-12-21

This consolidated migration includes:
- Users table with composite indexes for performance
- Organizations table with personal workspace support
- Audit events table with composite indexes
- Permissions table (no seed data - permissions managed via API)
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create initial database schema."""
    
    # ========== ORGANIZATIONS TABLE ==========
    op.create_table(
        "organizations",
        sa.Column("id", sa.String(255), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False, unique=True, index=True),
        sa.Column("logo_url", sa.String(), nullable=True),
        sa.Column("settings", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("billing_email", sa.String(255), nullable=True),
        sa.Column("stripe_customer_id", sa.String(255), nullable=True),
        sa.Column("plan", sa.String(50), nullable=False, server_default="free"),
        sa.Column("plan_limits", postgresql.JSONB(), nullable=False, server_default="{}"),
        # Personal workspace fields
        sa.Column("is_personal_workspace", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("owner_user_id", sa.String(255), nullable=True, index=True),
        # Timestamps (timezone-aware)
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )

    # ========== USERS TABLE ==========
    op.create_table(
        "users",
        sa.Column("id", sa.String(255), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("first_name", sa.String(255), nullable=True),
        sa.Column("last_name", sa.String(255), nullable=True),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("email_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("settings", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_login_ip", sa.String(45), nullable=True),
        # Timestamps (timezone-aware)
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )

    # Users composite indexes for performance
    op.create_index(
        "ix_users_email_verified",
        "users",
        ["email", "email_verified"],
        unique=False
    )
    op.create_index(
        "ix_users_login",
        "users",
        ["last_login_at", "last_login_ip"],
        unique=False
    )

    # ========== AUDIT EVENTS TABLE ==========
    op.create_table(
        "audit_events",
        sa.Column("id", sa.String(255), primary_key=True),
        sa.Column("organization_id", sa.String(255), nullable=False, index=True),
        sa.Column("user_id", sa.String(255), nullable=False, index=True),
        sa.Column("user_email", sa.String(255), nullable=False),
        sa.Column("action", sa.String(255), nullable=False, index=True),
        sa.Column("target_type", sa.String(255), nullable=True),
        sa.Column("target_id", sa.String(255), nullable=True),
        sa.Column("target_name", sa.String(255), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.String(), nullable=True),
        sa.Column("source", sa.String(50), nullable=False, server_default="workos"),
        sa.Column("event_metadata", postgresql.JSONB(), nullable=False, server_default="{}"),
        # Timestamps (timezone-aware)
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )

    # Audit events composite indexes for performance
    op.create_index(
        "ix_audit_events_org_user_time",
        "audit_events",
        ["organization_id", "user_id", "created_at"],
        unique=False
    )
    op.create_index(
        "ix_audit_events_action_time",
        "audit_events",
        ["action", "created_at"],
        unique=False
    )

    # ========== PERMISSIONS TABLE ==========
    op.create_table(
        "permissions",
        sa.Column("id", sa.String(255), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("description", sa.String(500), nullable=False),
        sa.Column("category", sa.String(100), nullable=False, index=True),
        # Timestamps (timezone-aware)
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )


def downgrade() -> None:
    """Drop all tables."""
    # Drop tables in reverse order
    op.drop_table("permissions")
    op.drop_table("audit_events")
    op.drop_table("users")
    op.drop_table("organizations")

