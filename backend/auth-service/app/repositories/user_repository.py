"""User repository for data access abstraction."""

from typing import Protocol

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User


class UserRepository(Protocol):
    """Protocol defining user repository interface."""

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
    """SQLAlchemy implementation of UserRepository."""

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

