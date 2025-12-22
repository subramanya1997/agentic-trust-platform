"""User model - synced from WorkOS User Management.

This module defines the User model and related schemas for user management.
Users are synced from WorkOS and stored locally for faster access and additional
metadata tracking.

Key Features:
- WorkOS ID integration (id format: user_xxxxx)
- Email verification tracking
- Login tracking (last login time and IP)
- User settings storage (JSONB)
- Display name computation

Database Schema:
    users table:
    - id VARCHAR(255) PRIMARY KEY (WorkOS ID)
    - email VARCHAR(255) UNIQUE NOT NULL INDEXED
    - first_name VARCHAR(255) NULLABLE
    - last_name VARCHAR(255) NULLABLE
    - avatar_url TEXT NULLABLE
    - email_verified BOOLEAN DEFAULT FALSE
    - settings JSONB DEFAULT '{}'
    - last_login_at TIMESTAMP WITH TIME ZONE NULLABLE
    - last_login_ip VARCHAR(45) NULLABLE (IPv6 support)
    - created_at TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    
    Indexes:
    - ix_users_email_verified: (email, email_verified) - for verification queries
    - ix_users_login: (last_login_at, last_login_ip) - for login tracking queries

Usage:
    from app.models import User
    from app.database import get_db
    
    async def get_user(user_id: str):
        async with get_db() as db:
            user = await db.get(User, user_id)
            return user
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


class UserBase(BaseModel):
    """Base user fields shared across User model and schemas.
    
    This class contains the common fields that are used in both the database
    model and the API response schemas. It inherits from BaseModel to get
    id, created_at, and updated_at fields.
    
    Attributes:
        email (str): User's email address (unique, indexed)
        first_name (str | None): User's first name
        last_name (str | None): User's last name
        avatar_url (str | None): URL to user's avatar/profile picture
    """

    email: str = Field(
        max_length=255,
        unique=True,
        index=True,
        description="User's email address (unique, indexed for fast lookups)",
    )
    first_name: str | None = Field(
        max_length=255,
        default=None,
        description="User's first name",
    )
    last_name: str | None = Field(
        max_length=255,
        default=None,
        description="User's last name",
    )
    avatar_url: str | None = Field(
        default=None,
        description="URL to user's avatar/profile picture",
    )


class User(UserBase, table=True):
    """
    User model - synced from WorkOS User Management.

    This is the main database model for users. Users are synced from WorkOS
    User Management and stored locally for faster access and additional metadata.

    Key Features:
    - WorkOS ID integration (id format: user_xxxxx)
    - Email verification status tracking
    - Login tracking (last login time and IP address)
    - User settings storage in JSONB format
    - Composite indexes for common query patterns

    Database Table:
        Table name: "users"
        Schema: auth (set via database configuration)

    Indexes:
        - Primary: id (WorkOS user ID)
        - Unique: email
        - Composite: (email, email_verified) for verification queries
        - Composite: (last_login_at, last_login_ip) for login tracking

    Attributes:
        id (str): WorkOS user ID (format: user_xxxxx), primary key
        email (str): User's email address (unique, indexed)
        first_name (str | None): User's first name
        last_name (str | None): User's last name
        avatar_url (str | None): URL to user's avatar
        email_verified (bool): Whether email has been verified (default: False)
        settings (dict): User preferences and settings (JSONB, default: {})
        last_login_at (datetime | None): Timestamp of last login
        last_login_ip (str | None): IP address of last login (supports IPv6)
        created_at (datetime): When user record was created
        updated_at (datetime): When user record was last updated

    Properties:
        display_name (str): Computed display name (first + last, or first, or email prefix)

    Example:
        >>> user = User(
        ...     id="user_01ABC123",
        ...     email="john@example.com",
        ...     first_name="John",
        ...     last_name="Doe",
        ...     email_verified=True
        ... )
        >>> user.display_name
        "John Doe"
    """

    __tablename__ = "users"
    __table_args__ = (
        # Composite index for email verification queries
        # Used when filtering by email and verification status
        Index("ix_users_email_verified", "email", "email_verified"),
        # Composite index for login tracking queries
        # Used when querying recent logins or login history
        Index("ix_users_login", "last_login_at", "last_login_ip"),
    )

    # Override id since WorkOS provides it (format: user_xxxxx)
    id: str = Field(
        primary_key=True,
        max_length=255,
        description="WorkOS user ID (format: user_xxxxx)",
    )
    email_verified: bool = Field(
        default=False,
        description="Whether the user's email has been verified",
    )
    settings: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB),
        description="User preferences and settings stored as JSON",
    )
    last_login_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
        description="Timezone-aware timestamp of last login",
    )
    last_login_ip: str | None = Field(
        max_length=45,
        default=None,
        description="IP address of last login (supports IPv6, max 45 chars)",
    )
    # created_at and updated_at inherited from BaseModel

    @property
    def display_name(self) -> str:
        """Get user's display name.
        
        Computes a human-readable display name based on available information.
        Priority: first_name + last_name > first_name > email prefix.
        
        Returns:
            str: Display name for the user
            
        Example:
            >>> user = User(first_name="John", last_name="Doe", email="john@example.com")
            >>> user.display_name
            "John Doe"
            
            >>> user = User(first_name="John", email="john@example.com")
            >>> user.display_name
            "John"
            
            >>> user = User(email="john@example.com")
            >>> user.display_name
            "john"
        """
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        if self.first_name:
            return self.first_name
        return self.email.split("@")[0]


class UserCreate(SQLModel):
    """Schema for creating a user (from WorkOS sync).
    
    This schema is used when syncing a user from WorkOS to the local database.
    It contains all the fields needed to create a new user record.
    
    Attributes:
        id (str): WorkOS user ID (format: user_xxxxx)
        email (str): User's email address
        first_name (str | None): User's first name (optional)
        last_name (str | None): User's last name (optional)
        email_verified (bool): Whether email is verified (default: False)
        avatar_url (str | None): URL to user's avatar (optional)
    
    Usage:
        >>> user_data = UserCreate(
        ...     id="user_01ABC123",
        ...     email="john@example.com",
        ...     first_name="John",
        ...     last_name="Doe",
        ...     email_verified=True
        ... )
    """

    id: str = Field(description="WorkOS user ID")
    email: str = Field(description="User's email address")
    first_name: str | None = Field(default=None, description="User's first name")
    last_name: str | None = Field(default=None, description="User's last name")
    email_verified: bool = Field(
        default=False,
        description="Whether email has been verified",
    )
    avatar_url: str | None = Field(default=None, description="URL to user's avatar")


class UserRead(UserBase):
    """Schema for reading user data in API responses.
    
    This schema defines what user data is exposed in API responses.
    It includes the base user fields plus additional read-only fields.
    
    Attributes:
        id (str): User ID (WorkOS format)
        email (str): User's email address
        first_name (str | None): User's first name
        last_name (str | None): User's last name
        avatar_url (str | None): URL to user's avatar
        email_verified (bool): Whether email is verified
        created_at (datetime): When user account was created
    
    Usage:
        Used as response_model in FastAPI route handlers:
        
        @router.get("/users/me", response_model=UserRead)
        async def get_current_user(user: User = Depends(get_current_user)):
            return user
    """

    id: str = Field(description="User ID")
    email_verified: bool = Field(description="Whether email is verified")
    created_at: datetime = Field(description="When user account was created")

