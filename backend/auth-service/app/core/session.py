"""Session data types for WorkOS authentication.

This module defines Pydantic models for representing session data extracted
from WorkOS sealed sessions. These models are used throughout the application
for accessing authenticated user information and organization context.

Key Features:
- Type-safe session data models
- User information extraction
- Organization and role context
- Admin check helper

Usage:
    from app.core.session import SessionData, SessionUser
    from app.dependencies import get_session
    
    @router.get("/protected")
    async def protected_route(session: SessionData = Depends(get_session)):
        user = session.user
        org_id = session.organization_id
        is_admin = session.is_admin
        ...
"""

from pydantic import BaseModel


class SessionUser(BaseModel):
    """User information extracted from WorkOS session.
    
    This model represents the user data contained in a WorkOS sealed session.
    It's a lightweight representation used for authentication and authorization
    throughout the application.
    
    Attributes:
        id (str): WorkOS user ID (format: user_xxxxx)
        email (str): User's email address
        first_name (str | None): User's first name (optional)
        last_name (str | None): User's last name (optional)
        email_verified (bool): Whether email has been verified (default: False)
        profile_picture_url (str | None): URL to user's profile picture (optional)
    
    Example:
        >>> user = SessionUser(
        ...     id="user_01ABC123",
        ...     email="john@example.com",
        ...     first_name="John",
        ...     last_name="Doe",
        ...     email_verified=True
        ... )
    """

    id: str
    email: str
    first_name: str | None = None
    last_name: str | None = None
    email_verified: bool = False
    profile_picture_url: str | None = None


class SessionData(BaseModel):
    """Parsed WorkOS session data with user and organization context.
    
    This model represents the complete session data extracted from a WorkOS
    sealed session cookie. It includes user information, current organization
    context, and role information.
    
    Attributes:
        user (SessionUser): User information from the session
        organization_id (str | None): Current organization ID (from X-Organization-ID header or session)
        role (str | None): User's role in the current organization (e.g., "admin", "member", "viewer")
    
    Properties:
        is_admin (bool): True if user has admin role in current organization
    
    Example:
        >>> session = SessionData(
        ...     user=SessionUser(id="user_123", email="john@example.com"),
        ...     organization_id="org_456",
        ...     role="admin"
        ... )
        >>> session.is_admin
        True
    """

    user: SessionUser
    organization_id: str | None = None
    role: str | None = None

    @property
    def is_admin(self) -> bool:
        """Check if user is an admin in current organization.
        
        Returns:
            bool: True if user has "admin" role, False otherwise
            
        Example:
            >>> session = SessionData(user=..., role="admin")
            >>> session.is_admin
            True
            
            >>> session = SessionData(user=..., role="member")
            >>> session.is_admin
            False
        """
        return self.role == "admin"

