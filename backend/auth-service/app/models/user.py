"""User model - synced from WorkOS User Management."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


class UserBase(BaseModel):
    """Base user fields."""

    email: str = Field(max_length=255, unique=True, index=True)
    first_name: str | None = Field(max_length=255, default=None)
    last_name: str | None = Field(max_length=255, default=None)
    avatar_url: str | None = None


class User(UserBase, table=True):
    """
    User model - synced from WorkOS User Management.

    The ID comes from WorkOS (format: user_xxxxx).
    """

    __tablename__ = "users"
    __table_args__ = (
        # Composite index for email verification queries
        Index("ix_users_email_verified", "email", "email_verified"),
        # Composite index for login tracking queries
        Index("ix_users_login", "last_login_at", "last_login_ip"),
    )

    # Override id since WorkOS provides it
    id: str = Field(primary_key=True, max_length=255)
    email_verified: bool = Field(default=False)
    settings: dict = Field(default_factory=dict, sa_column=Column(JSONB))
    last_login_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    last_login_ip: str | None = Field(max_length=45, default=None)
    # created_at and updated_at inherited from BaseModel

    @property
    def display_name(self) -> str:
        """Get user's display name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        if self.first_name:
            return self.first_name
        return self.email.split("@")[0]


class UserCreate(SQLModel):
    """Schema for creating a user (from WorkOS sync)."""

    id: str
    email: str
    first_name: str | None = None
    last_name: str | None = None
    email_verified: bool = False
    avatar_url: str | None = None


class UserRead(UserBase):
    """Schema for reading user data."""

    id: str
    email_verified: bool
    created_at: datetime

