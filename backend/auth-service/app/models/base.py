"""Base models with common timestamp fields.

This module provides the base model class that all database models inherit from.
It includes common fields like ID generation and timestamp tracking.

Key Features:
- UUID-based primary keys for all models
- Automatic timestamp tracking (created_at, updated_at)
- Timezone-aware datetime fields
- Consistent model structure across the application

Usage:
    from app.models.base import BaseModel
    
    class MyModel(BaseModel, table=True):
        name: str = Field(max_length=255)
        # id, created_at, updated_at are inherited
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel

from app.core.time import utc_now


def generate_uuid() -> str:
    """Generate a UUID string for primary keys.
    
    Uses UUID4 (random UUID) to ensure globally unique identifiers.
    This is safer than sequential IDs as it prevents enumeration attacks.
    
    Returns:
        str: A UUID4 string (e.g., "550e8400-e29b-41d4-a716-446655440000")
        
    Example:
        >>> id = generate_uuid()
        >>> len(id)
        36
    """
    return str(uuid4())


class BaseModel(SQLModel):
    """
    Base model with id and timestamps for all database tables.
    
    This is the foundation class for all database models in the application.
    It provides consistent ID generation and timestamp tracking across all tables.
    
    Attributes:
        id (str): UUID string primary key, automatically generated
        created_at (datetime): Timezone-aware timestamp when record was created
        updated_at (datetime): Timezone-aware timestamp when record was last updated
    
    Database Schema:
        All tables using this base model will have:
        - id VARCHAR(255) PRIMARY KEY
        - created_at TIMESTAMP WITH TIME ZONE NOT NULL
        - updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    
    Usage:
        from app.models.base import BaseModel
        from sqlmodel import Field
        
        class User(BaseModel, table=True):
            email: str = Field(max_length=255, unique=True)
            # id, created_at, updated_at are automatically included
    
    Notes:
        - The id field uses UUID4 for security (prevents enumeration)
        - Timestamps are timezone-aware (UTC) for consistency
        - updated_at should be manually updated on record modifications
        - Some models may override id if they use external IDs (e.g., WorkOS IDs)
    """
    
    id: str = Field(
        default_factory=generate_uuid,
        primary_key=True,
        max_length=255,
        description="UUID string primary key, automatically generated",
    )
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_type=DateTime(timezone=True),
        nullable=False,
        description="Timezone-aware timestamp when record was created",
    )
    updated_at: datetime = Field(
        default_factory=utc_now,
        sa_type=DateTime(timezone=True),
        nullable=False,
        description="Timezone-aware timestamp when record was last updated",
    )
