"""Shared models for cross-service authentication."""

from dataclasses import dataclass
from typing import Any


@dataclass
class ServiceUser:
    """Lightweight user model for cross-service communication.
    
    This contains only the essential user data that services need.
    For full user details, services should call the auth-service API.
    """
    
    user_id: str
    email: str
    organization_id: str | None = None
    role: str = "member"
    permissions: list[str] | None = None
    
    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JWT encoding."""
        return {
            "user_id": self.user_id,
            "email": self.email,
            "organization_id": self.organization_id,
            "role": self.role,
            "permissions": self.permissions or [],
        }
    
    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "ServiceUser":
        """Create from dictionary (JWT payload)."""
        return cls(
            user_id=data["user_id"],
            email=data["email"],
            organization_id=data.get("organization_id"),
            role=data.get("role", "member"),
            permissions=data.get("permissions"),
        )

