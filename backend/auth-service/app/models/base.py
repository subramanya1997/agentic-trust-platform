"""Base models with common timestamp fields."""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel

from app.core.time import utc_now


def generate_uuid() -> str:
    """Generate a UUID string for primary keys."""
    return str(uuid4())


class BaseModel(SQLModel):
    """
    Base model with id and timestamps for all database tables.
    
    Provides:
    - id: UUID string primary key
    - created_at: timezone-aware timestamp
    - updated_at: timezone-aware timestamp
    """
    
    id: str = Field(
        default_factory=generate_uuid,
        primary_key=True,
        max_length=255,
    )
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_type=DateTime(timezone=True),
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=utc_now,
        sa_type=DateTime(timezone=True),
        nullable=False,
    )
