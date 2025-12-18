"""WorkOS synchronization service."""

from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core import workos_client
from app.core.session import SessionUser
from app.models import Organization, User


class WorkOSService:
    """Service for syncing WorkOS data to local database."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def sync_user_from_session(self, session_user: SessionUser) -> User:
        """Sync user from WorkOS session to local database."""
        user = await self.db.get(User, session_user.id)

        if not user:
            user = User(
                id=session_user.id,
                email=session_user.email,
                first_name=session_user.first_name,
                last_name=session_user.last_name,
                email_verified=session_user.email_verified,
                avatar_url=session_user.profile_picture_url,
            )
            self.db.add(user)
        else:
            user.email = session_user.email
            user.first_name = session_user.first_name
            user.last_name = session_user.last_name
            user.email_verified = session_user.email_verified
            if session_user.profile_picture_url:
                user.avatar_url = session_user.profile_picture_url
            user.updated_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def sync_user(self, workos_user) -> User:
        """Sync user from WorkOS API response to local database."""
        user = await self.db.get(User, workos_user.id)

        if not user:
            user = User(
                id=workos_user.id,
                email=workos_user.email,
                first_name=workos_user.first_name,
                last_name=workos_user.last_name,
                email_verified=workos_user.email_verified,
                avatar_url=getattr(workos_user, "profile_picture_url", None),
            )
            self.db.add(user)
        else:
            user.email = workos_user.email
            user.first_name = workos_user.first_name
            user.last_name = workos_user.last_name
            user.email_verified = workos_user.email_verified
            user.updated_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def sync_organization(self, organization_id: str) -> Organization:
        """Sync organization from WorkOS to local database."""
        org = await self.db.get(Organization, organization_id)

        if not org:
            workos_org = workos_client.get_organization(organization_id)

            org = Organization(
                id=workos_org.id,
                name=workos_org.name,
                slug=Organization.generate_slug(workos_org.name),
            )
            self.db.add(org)
            await self.db.commit()
            await self.db.refresh(org)

        return org

    async def update_user_login(
        self,
        user: User,
        ip_address: str | None = None,
    ) -> User:
        """Update user's last login timestamp."""
        user.last_login_at = datetime.utcnow()
        if ip_address:
            user.last_login_ip = ip_address

        await self.db.commit()
        await self.db.refresh(user)
        return user

