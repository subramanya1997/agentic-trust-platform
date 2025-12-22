"""Repository layer for data access abstraction.

This package provides repository pattern implementations for data access.
Repositories abstract database operations, making code more testable and
allowing for easy implementation swapping.

Exports:
    - UserRepository: Protocol interface for user data access
    - SQLAlchemyUserRepository: SQLAlchemy implementation for users
    - OrganizationRepository: Protocol interface for organization data access
    - SQLAlchemyOrganizationRepository: SQLAlchemy implementation for organizations

Usage:
    from app.repositories import SQLAlchemyUserRepository
    from app.database import get_db
    
    async with get_db() as db:
        repo = SQLAlchemyUserRepository(db)
        user = await repo.get_by_email("user@example.com")
"""

from app.repositories.organization_repository import (
    OrganizationRepository,
    SQLAlchemyOrganizationRepository,
)
from app.repositories.user_repository import SQLAlchemyUserRepository, UserRepository

__all__ = [
    "UserRepository",
    "SQLAlchemyUserRepository",
    "OrganizationRepository",
    "SQLAlchemyOrganizationRepository",
]

