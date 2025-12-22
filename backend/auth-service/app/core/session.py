"""Session data types for WorkOS authentication."""

from pydantic import BaseModel


class SessionUser(BaseModel):
    """User information from WorkOS session."""

    id: str
    email: str
    first_name: str | None = None
    last_name: str | None = None
    email_verified: bool = False
    profile_picture_url: str | None = None


class SessionData(BaseModel):
    """Parsed WorkOS session data."""

    user: SessionUser
    organization_id: str | None = None
    role: str | None = None

    @property
    def is_admin(self) -> bool:
        """Check if user is an admin in current org."""
        return self.role == "admin"

