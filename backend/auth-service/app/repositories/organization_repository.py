"""Organization repository for data access abstraction."""

from typing import Protocol

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Organization


class OrganizationRepository(Protocol):
    """Protocol defining organization repository interface."""

    async def get_by_id(self, org_id: str) -> Organization | None:
        """Get organization by ID."""
        ...

    async def get_by_slug(self, slug: str) -> Organization | None:
        """Get organization by slug."""
        ...

    async def get_by_ids(self, org_ids: list[str]) -> list[Organization]:
        """Batch get organizations by IDs."""
        ...

    async def create(self, organization: Organization) -> Organization:
        """Create a new organization."""
        ...

    async def update(self, organization: Organization) -> Organization:
        """Update an existing organization."""
        ...

    async def delete(self, org_id: str) -> bool:
        """Delete an organization."""
        ...


class SQLAlchemyOrganizationRepository:
    """SQLAlchemy implementation of OrganizationRepository."""

    def __init__(self, db: AsyncSession):
        """
        Initialize repository with database session.
        
        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    async def get_by_id(self, org_id: str) -> Organization | None:
        """
        Get organization by ID.
        
        Args:
            org_id: Organization ID to fetch
            
        Returns:
            Organization instance or None if not found
        """
        return await self.db.get(Organization, org_id)

    async def get_by_slug(self, slug: str) -> Organization | None:
        """
        Get organization by slug.
        
        Args:
            slug: Organization slug to search for
            
        Returns:
            Organization instance or None if not found
        """
        stmt = select(Organization).where(Organization.slug == slug)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_ids(self, org_ids: list[str]) -> list[Organization]:
        """
        Batch get organizations by IDs.
        
        Args:
            org_ids: List of organization IDs to fetch
            
        Returns:
            List of Organization instances
        """
        if not org_ids:
            return []
        
        stmt = select(Organization).where(Organization.id.in_(org_ids))
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, organization: Organization) -> Organization:
        """
        Create a new organization.
        
        Args:
            organization: Organization instance to create
            
        Returns:
            Created organization instance
        """
        self.db.add(organization)
        await self.db.flush()
        await self.db.refresh(organization)
        return organization

    async def update(self, organization: Organization) -> Organization:
        """
        Update an existing organization.
        
        Args:
            organization: Organization instance with updated fields
            
        Returns:
            Updated organization instance
        """
        await self.db.flush()
        await self.db.refresh(organization)
        return organization

    async def delete(self, org_id: str) -> bool:
        """
        Delete an organization.
        
        Args:
            org_id: ID of organization to delete
            
        Returns:
            True if deleted, False if not found
        """
        org = await self.get_by_id(org_id)
        if org:
            await self.db.delete(org)
            await self.db.flush()
            return True
        return False

