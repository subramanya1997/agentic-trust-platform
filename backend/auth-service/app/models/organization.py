"""Organization model - synced from WorkOS Organizations.

This module defines the Organization model and related schemas for organization
management. Organizations represent workspaces/tenants in the multi-tenant system.

Key Features:
- WorkOS ID integration (id format: org_xxxxx)
- URL-safe slug generation for friendly URLs
- Billing integration (Stripe customer ID)
- Plan and limits management
- Personal workspace flag
- Owner tracking

Database Schema:
    organizations table:
    - id VARCHAR(255) PRIMARY KEY (WorkOS ID)
    - name VARCHAR(255) NOT NULL
    - slug VARCHAR(100) UNIQUE NOT NULL INDEXED
    - logo_url TEXT NULLABLE
    - settings JSONB DEFAULT '{}'
    - billing_email VARCHAR(255) NULLABLE
    - stripe_customer_id VARCHAR(255) NULLABLE
    - plan VARCHAR(50) DEFAULT 'free'
    - plan_limits JSONB DEFAULT '{}'
    - is_personal_workspace BOOLEAN DEFAULT FALSE
    - owner_user_id VARCHAR(255) NULLABLE INDEXED
    - created_at TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at TIMESTAMP WITH TIME ZONE NOT NULL

Usage:
    from app.models import Organization
    
    # Generate slug from name
    slug = Organization.generate_slug("Acme Corporation")
    # Returns: "acme-corporation"
"""

import re
from datetime import datetime

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


class OrganizationBase(BaseModel):
    """Base organization fields shared across Organization model and schemas.
    
    Contains the core fields that identify an organization: name and slug.
    The slug is used for URL-friendly organization identifiers.
    
    Attributes:
        name (str): Organization name (max 255 characters)
        slug (str): URL-safe slug (max 100 characters, unique, indexed)
    """

    name: str = Field(
        max_length=255,
        description="Organization name",
    )
    slug: str = Field(
        max_length=100,
        unique=True,
        index=True,
        description="URL-safe slug for organization (unique, indexed)",
    )


class Organization(OrganizationBase, table=True):
    """
    Organization model - synced from WorkOS Organizations.

    Represents a workspace/tenant in the multi-tenant system. Organizations
    are synced from WorkOS and stored locally for faster access and additional
    metadata like billing information and plan limits.

    Key Features:
    - WorkOS ID integration (id format: org_xxxxx)
    - Billing integration via Stripe customer ID
    - Plan management (free, pro, enterprise, etc.)
    - Plan limits stored as JSONB
    - Personal workspace flag for single-user organizations
    - Owner tracking for personal workspaces

    Database Table:
        Table name: "organizations"
        Schema: auth (set via database configuration)

    Attributes:
        id (str): WorkOS organization ID (format: org_xxxxx), primary key
        name (str): Organization name
        slug (str): URL-safe slug (unique, indexed)
        logo_url (str | None): URL to organization logo
        settings (dict): Organization settings (JSONB, default: {})
        billing_email (str | None): Email for billing notifications
        stripe_customer_id (str | None): Stripe customer ID for billing
        plan (str): Current plan (default: "free")
        plan_limits (dict): Plan-specific limits (JSONB, default: {})
        is_personal_workspace (bool): True if this is a personal workspace
        owner_user_id (str | None): User ID of owner (for personal workspaces)
        created_at (datetime): When organization was created
        updated_at (datetime): When organization was last updated

    Static Methods:
        generate_slug(name: str) -> str: Generate URL-safe slug from name

    Example:
        >>> org = Organization(
        ...     id="org_01ABC123",
        ...     name="Acme Corp",
        ...     slug="acme-corp",
        ...     plan="pro",
        ...     is_personal_workspace=False
        ... )
        >>> slug = Organization.generate_slug("My Company!")
        >>> slug
        "my-company"
    """

    __tablename__ = "organizations"

    # Override id since WorkOS provides it (format: org_xxxxx)
    id: str = Field(
        primary_key=True,
        max_length=255,
        description="WorkOS organization ID (format: org_xxxxx)",
    )
    logo_url: str | None = Field(
        default=None,
        description="URL to organization logo",
    )
    settings: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Organization settings stored as JSON",
    )
    billing_email: str | None = Field(
        max_length=255,
        default=None,
        description="Email address for billing notifications",
    )
    stripe_customer_id: str | None = Field(
        max_length=255,
        default=None,
        description="Stripe customer ID for billing integration",
    )
    plan: str = Field(
        default="free",
        max_length=50,
        description="Current subscription plan (free, pro, enterprise, etc.)",
    )
    plan_limits: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="Plan-specific limits (e.g., max_agents, max_executions)",
    )
    is_personal_workspace: bool = Field(
        default=False,
        description="True if this is a personal workspace (single user)",
    )
    owner_user_id: str | None = Field(
        max_length=255,
        default=None,
        index=True,
        description="User ID of owner (for personal workspaces, indexed)",
    )
    # created_at and updated_at inherited from BaseModel

    @staticmethod
    def generate_slug(name: str) -> str:
        """Generate URL-safe slug from organization name.
        
        Converts an organization name into a URL-safe slug by:
        1. Converting to lowercase
        2. Removing non-alphanumeric characters (except spaces and hyphens)
        3. Replacing spaces and underscores with hyphens
        4. Collapsing multiple hyphens into one
        5. Trimming hyphens from start/end
        6. Limiting to 100 characters
        
        Args:
            name: Organization name to convert
            
        Returns:
            str: URL-safe slug (max 100 characters)
            
        Example:
            >>> Organization.generate_slug("Acme Corporation!")
            "acme-corporation"
            >>> Organization.generate_slug("My   Company___Name")
            "my-company-name"
            >>> Organization.generate_slug("Test---Organization")
            "test-organization"
        """
        slug = name.lower()
        # Remove non-alphanumeric characters except spaces and hyphens
        slug = re.sub(r"[^a-z0-9\s-]", "", slug)
        # Replace spaces and underscores with hyphens
        slug = re.sub(r"[\s_]+", "-", slug)
        # Collapse multiple hyphens into one
        slug = re.sub(r"-+", "-", slug)
        # Trim hyphens from start/end and limit length
        return slug.strip("-")[:100]


class OrganizationCreate(SQLModel):
    """Schema for creating an organization."""

    id: str
    name: str
    slug: str | None = None


class OrganizationRead(OrganizationBase):
    """Schema for reading organization data."""

    id: str
    logo_url: str | None
    billing_email: str | None
    plan: str
    is_personal_workspace: bool
    owner_user_id: str | None
    created_at: datetime

