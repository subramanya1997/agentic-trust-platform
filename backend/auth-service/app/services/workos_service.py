"""WorkOS synchronization service."""

import asyncio
import logging
from datetime import datetime

from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import workos_client
from app.core.exceptions import DatabaseError
from app.core.session import SessionUser
from app.core.time import utc_now
from app.models import Organization, User

logger = logging.getLogger(__name__)


class WorkOSService:
    """Service for syncing WorkOS data to local database."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def _sync_user_data(
        self,
        user_id: str,
        email: str,
        first_name: str | None,
        last_name: str | None,
        email_verified: bool,
        avatar_url: str | None,
    ) -> User:
        """
        Internal method to sync user data to local database with retry logic.
        
        Uses explicit transaction handling with savepoints and exponential backoff
        retry for handling concurrent modifications.
        
        Args:
            user_id: WorkOS user ID
            email: User email address
            first_name: User's first name
            last_name: User's last name
            email_verified: Whether email is verified
            avatar_url: Profile picture URL
            
        Returns:
            Synced User instance
            
        Raises:
            DatabaseError: If sync fails after all retries
        """
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                async with self.db.begin_nested():  # Create savepoint
                    # Use SELECT...FOR UPDATE to lock the row
                    user = await self.db.get(User, user_id, with_for_update=True)

                    if not user:
                        user = User(
                            id=user_id,
                            email=email,
                            first_name=first_name,
                            last_name=last_name,
                            email_verified=email_verified,
                            avatar_url=avatar_url,
                        )
                        self.db.add(user)
                    else:
                        user.email = email
                        user.first_name = first_name
                        user.last_name = last_name
                        user.email_verified = email_verified
                        if avatar_url:
                            user.avatar_url = avatar_url
                        user.updated_at = utc_now()

                    await self.db.flush()  # Flush within savepoint
                
                await self.db.commit()
                await self.db.refresh(user)
                return user
                
            except (IntegrityError, OperationalError) as e:
                await self.db.rollback()
                
                if attempt == max_retries - 1:
                    logger.error(
                        "Failed to sync user after all retries",
                        exc_info=True,
                        extra={"user_id": user_id, "email": email, "attempt": attempt + 1},
                    )
                    raise DatabaseError(
                        f"Failed to sync user {user_id} after {max_retries} attempts",
                        {"user_id": user_id, "original_error": str(e)},
                    )
                
                # Exponential backoff
                wait_time = 0.1 * (2 ** attempt)
                logger.warning(
                    f"Database conflict syncing user, retrying in {wait_time}s",
                    extra={"user_id": user_id, "attempt": attempt + 1, "wait_time": wait_time},
                )
                await asyncio.sleep(wait_time)

    async def sync_user_from_session(self, session_user: SessionUser) -> User:
        """Sync user from WorkOS session to local database."""
        return await self._sync_user_data(
            user_id=session_user.id,
            email=session_user.email,
            first_name=session_user.first_name,
            last_name=session_user.last_name,
            email_verified=session_user.email_verified,
            avatar_url=session_user.profile_picture_url,
        )

    async def sync_user(self, workos_user) -> User:
        """Sync user from WorkOS API response to local database."""
        return await self._sync_user_data(
            user_id=workos_user.id,
            email=workos_user.email,
            first_name=workos_user.first_name,
            last_name=workos_user.last_name,
            email_verified=workos_user.email_verified,
            avatar_url=getattr(workos_user, "profile_picture_url", None),
        )

    async def sync_organization(self, organization_id: str) -> Organization:
        """
        Sync organization from WorkOS to local database with retry logic.
        
        Args:
            organization_id: WorkOS organization ID
            
        Returns:
            Synced Organization instance
            
        Raises:
            DatabaseError: If sync fails after all retries
        """
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                async with self.db.begin_nested():  # Create savepoint
                    org = await self.db.get(Organization, organization_id, with_for_update=True)

                    if not org:
                        workos_org = workos_client.get_organization(organization_id)

                        org = Organization(
                            id=workos_org.id,
                            name=workos_org.name,
                            slug=Organization.generate_slug(workos_org.name),
                        )
                        self.db.add(org)
                    
                    await self.db.flush()
                
                await self.db.commit()
                await self.db.refresh(org)
                return org
                
            except (IntegrityError, OperationalError) as e:
                await self.db.rollback()
                
                if attempt == max_retries - 1:
                    logger.error(
                        "Failed to sync organization after all retries",
                        exc_info=True,
                        extra={"organization_id": organization_id, "attempt": attempt + 1},
                    )
                    raise DatabaseError(
                        f"Failed to sync organization {organization_id} after {max_retries} attempts",
                        {"organization_id": organization_id, "original_error": str(e)},
                    )
                
                wait_time = 0.1 * (2 ** attempt)
                logger.warning(
                    f"Database conflict syncing organization, retrying in {wait_time}s",
                    extra={"organization_id": organization_id, "attempt": attempt + 1, "wait_time": wait_time},
                )
                await asyncio.sleep(wait_time)

    async def update_user_login(
        self,
        user: User,
        ip_address: str | None = None,
    ) -> User:
        """Update user's last login timestamp."""
        user.last_login_at = utc_now()
        if ip_address:
            user.last_login_ip = ip_address

        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def ensure_user_has_organization(self, user: User) -> Organization:
        """
        Ensure user has at least one organization.
        If user has no organizations, create a personal workspace and add user as admin.
        
        Args:
            user: The user to check
            
        Returns:
            The user's organization (existing or newly created)
        """
        import logging
        
        logger = logging.getLogger(__name__)
        
        # Check if user has any organization memberships
        memberships = workos_client.list_organization_memberships(user_id=user.id)
        
        if memberships.data:
            # User already has organizations, return the first one
            return await self.sync_organization(memberships.data[0].organization_id)
        
        # User has no organizations, create a personal workspace
        logger.info(f"Creating personal workspace for user {user.email}")
        
        # Generate workspace name from user's name or email
        if user.first_name:
            workspace_name = f"{user.first_name}'s Workspace"
        else:
            # Use email prefix if no first name
            email_prefix = user.email.split("@")[0]
            workspace_name = f"{email_prefix}'s Workspace"
        
        # Create organization in WorkOS
        workos_org = workos_client.create_organization(name=workspace_name)
        
        # Create membership with admin role
        workos_client.create_organization_membership(
            user_id=user.id,
            organization_id=workos_org.id,
            role="admin",
        )
        
        # Sync to local database with personal workspace flags
        org = Organization(
            id=workos_org.id,
            name=workos_org.name,
            slug=Organization.generate_slug(workos_org.name),
            is_personal_workspace=True,
            owner_user_id=user.id,
        )
        self.db.add(org)
        await self.db.commit()
        await self.db.refresh(org)
        
        logger.info(f"Created personal workspace '{workspace_name}' (ID: {org.id}) for user {user.email}")
        
        return org

    async def get_user_by_id(self, user_id: str) -> User | None:
        """
        Get user by ID from database.
        
        Args:
            user_id: The user ID to fetch
            
        Returns:
            User instance or None if not found
        """
        return await self.db.get(User, user_id)

    async def get_organization_by_id(self, org_id: str) -> Organization | None:
        """
        Get organization by ID from database, syncing from WorkOS if not found.
        
        Args:
            org_id: The organization ID to fetch
            
        Returns:
            Organization instance or None
        """
        org = await self.db.get(Organization, org_id)
        if not org:
            # Try to sync from WorkOS
            org = await self.sync_organization(org_id)
        return org

    async def get_organizations_by_ids(self, org_ids: list[str]) -> dict[str, Organization]:
        """
        Batch fetch organizations by IDs, syncing missing ones from WorkOS.
        
        This method optimizes database access by fetching all organizations in a single
        query, then syncing any missing organizations from WorkOS.
        
        Args:
            org_ids: List of organization IDs to fetch
            
        Returns:
            Dictionary mapping org_id to Organization instance
        """
        from sqlalchemy import select
        
        if not org_ids:
            return {}
        
        # Batch fetch existing organizations from database
        stmt = select(Organization).where(Organization.id.in_(org_ids))
        result = await self.db.execute(stmt)
        orgs_dict = {org.id: org for org in result.scalars().all()}
        
        # Find missing organizations and sync them from WorkOS
        missing_ids = set(org_ids) - set(orgs_dict.keys())
        
        for org_id in missing_ids:
            try:
                org = await self.sync_organization(org_id)
                orgs_dict[org_id] = org
            except Exception as e:
                logger.warning(
                    f"Failed to sync organization {org_id}: {e}",
                    extra={"org_id": org_id, "error": str(e)},
                )
        
        return orgs_dict

    async def create_organization_with_sync(self, name: str) -> Organization:
        """
        Create organization in WorkOS and sync to local database.
        
        Args:
            name: The organization name
            
        Returns:
            Created and synced Organization instance
            
        Raises:
            DatabaseError: If creation or sync fails
        """
        try:
            # Create in WorkOS first
            workos_org = workos_client.create_organization(name=name)
            
            # Sync to local database
            org = Organization(
                id=workos_org.id,
                name=workos_org.name,
                slug=Organization.generate_slug(workos_org.name),
            )
            self.db.add(org)
            await self.db.commit()
            await self.db.refresh(org)
            
            logger.info(f"Created and synced organization: {org.name} (ID: {org.id})")
            return org
            
        except Exception as e:
            await self.db.rollback()
            logger.error(
                "Failed to create organization",
                exc_info=True,
                extra={"name": name, "error": str(e)},
            )
            raise DatabaseError(
                f"Failed to create organization: {e}",
                {"name": name, "original_error": str(e)},
            )

    async def update_organization(
        self,
        org: Organization,
        name: str | None = None,
        logo_url: str | None = None,
        billing_email: str | None = None,
        settings: dict | None = None,
    ) -> Organization:
        """
        Update organization in database.
        
        Args:
            org: The organization to update
            name: New name (optional)
            logo_url: New logo URL (optional)
            billing_email: New billing email (optional)
            settings: Settings to merge (optional)
            
        Returns:
            Updated Organization instance
            
        Raises:
            DatabaseError: If update fails
        """
        try:
            if name is not None:
                org.name = name
                org.slug = Organization.generate_slug(name)
            
            if logo_url is not None:
                org.logo_url = logo_url
            
            if billing_email is not None:
                org.billing_email = billing_email
            
            if settings is not None:
                org.settings = {**org.settings, **settings}
            
            await self.db.commit()
            await self.db.refresh(org)
            
            logger.info(f"Updated organization: {org.name} (ID: {org.id})")
            return org
            
        except Exception as e:
            await self.db.rollback()
            logger.error(
                "Failed to update organization",
                exc_info=True,
                extra={"org_id": org.id, "error": str(e)},
            )
            raise DatabaseError(
                f"Failed to update organization: {e}",
                {"org_id": org.id, "original_error": str(e)},
            )

    async def get_users_by_ids(self, user_ids: list[str]) -> dict[str, User]:
        """
        Batch fetch users by IDs from database.
        
        This method optimizes database access by fetching all users in a single
        query instead of N individual queries.
        
        Args:
            user_ids: List of user IDs to fetch
            
        Returns:
            Dictionary mapping user_id to User instance
        """
        from sqlalchemy import select
        
        if not user_ids:
            return {}
        
        stmt = select(User).where(User.id.in_(user_ids))
        result = await self.db.execute(stmt)
        users = result.scalars().all()
        
        return {user.id: user for user in users}
