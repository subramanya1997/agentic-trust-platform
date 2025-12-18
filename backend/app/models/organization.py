"""Organization model - synced from WorkOS Organizations."""

import re
from datetime import datetime

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class OrganizationBase(SQLModel):
    """Base organization fields."""

    name: str = Field(max_length=255)
    slug: str = Field(max_length=100, unique=True, index=True)


class Organization(OrganizationBase, table=True):
    """
    Organization model - synced from WorkOS Organizations.

    The ID comes from WorkOS (format: org_xxxxx).
    """

    __tablename__ = "organizations"

    id: str = Field(primary_key=True, max_length=255)
    logo_url: str | None = None
    settings: dict = Field(default_factory=dict, sa_column=Column(JSONB))
    billing_email: str | None = Field(max_length=255, default=None)
    stripe_customer_id: str | None = Field(max_length=255, default=None)
    plan: str = Field(default="free", max_length=50)
    plan_limits: dict = Field(default_factory=dict, sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @staticmethod
    def generate_slug(name: str) -> str:
        """Generate URL-safe slug from organization name."""
        slug = name.lower()
        slug = re.sub(r"[^a-z0-9\s-]", "", slug)
        slug = re.sub(r"[\s_]+", "-", slug)
        slug = re.sub(r"-+", "-", slug)
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
    plan: str
    created_at: datetime

