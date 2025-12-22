"""User repository for data access abstraction.

This module provides repository pattern implementation for user data access.
It defines both a Protocol interface and a SQLAlchemy implementation, allowing
for easy testing and potential future database migrations.

Key Features:
- Protocol-based interface for type safety
- SQLAlchemy implementation for PostgreSQL
- Batch operations for performance
- Clean separation of data access logic

Repository Pattern Benefits:
- Testability: Easy to mock for unit tests
- Flexibility: Can swap implementations (e.g., for caching)
- Clean code: Separates data access from business logic

Usage:
    from app.repositories import SQLAlchemyUserRepository
    from app.database import get_db
    
    async with get_db() as db:
        repo = SQLAlchemyUserRepository(db)
        user = await repo.get_by_email("user@example.com")
"""

from typing import Protocol

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User


class UserRepository(Protocol):
    """
    Protocol defining user repository interface.
    
    This protocol defines the contract for user data access operations.
    Any class implementing this protocol must provide these methods.
    Used for type checking and dependency injection.
    
    Methods:
        - get_by_id: Get user by ID
        - get_by_email: Get user by email
        - get_by_ids: Batch get users by IDs
        - create: Create new user
        - update: Update existing user
        - delete: Delete user
    """

    async def get_by_id(self, user_id: str) -> User | None:
        """Get user by ID."""
        ...

    async def get_by_email(self, email: str) -> User | None:
        """Get user by email."""
        ...

    async def get_by_ids(self, user_ids: list[str]) -> list[User]:
        """Batch get users by IDs."""
        ...

    async def create(self, user: User) -> User:
        """Create a new user."""
        ...

    async def update(self, user: User) -> User:
        """Update an existing user."""
        ...

    async def delete(self, user_id: str) -> bool:
        """Delete a user."""
        ...


class SQLAlchemyUserRepository:
    """
    SQLAlchemy implementation of UserRepository.
    
    This class provides the concrete implementation of user data access
    using SQLAlchemy and PostgreSQL. It implements all methods from the
    UserRepository protocol.
    
    Key Features:
    - Async database operations
    - Batch fetching for performance
    - Proper session management
    - Type-safe operations
    
    Example:
        repo = SQLAlchemyUserRepository(db_session)
        user = await repo.get_by_email("user@example.com")
        users = await repo.get_by_ids(["user_1", "user_2"])
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize repository with database session.
        
        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    async def get_by_id(self, user_id: str) -> User | None:
        """
        Get user by ID.
        
        Args:
            user_id: User ID to fetch
            
        Returns:
            User instance or None if not found
        """
        return await self.db.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        """
        Get user by email address.
        
        Args:
            email: Email address to search for
            
        Returns:
            User instance or None if not found
        """
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_ids(self, user_ids: list[str]) -> list[User]:
        """
        Batch get users by IDs.
        
        Args:
            user_ids: List of user IDs to fetch
            
        Returns:
            List of User instances
        """
        if not user_ids:
            return []
        
        stmt = select(User).where(User.id.in_(user_ids))
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, user: User) -> User:
        """
        Create a new user.
        
        Args:
            user: User instance to create
            
        Returns:
            Created user instance
        """
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def update(self, user: User) -> User:
        """
        Update an existing user.
        
        Args:
            user: User instance with updated fields
            
        Returns:
            Updated user instance
        """
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id: str) -> bool:
        """
        Delete a user.
        
        Args:
            user_id: ID of user to delete
            
        Returns:
            True if deleted, False if not found
        """
        user = await self.get_by_id(user_id)
        if user:
            await self.db.delete(user)
            await self.db.flush()
            return True
        return False

