"""Team management request and response schemas."""

from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.core.validators import ValidatedRole


class TeamMemberResponse(BaseModel):
    """Team member information."""

    id: str
    user_id: str
    email: str
    name: str | None
    role: str
    role_display_name: str  # Capitalized role name for display
    status: str
    avatar_url: str | None = None
    last_active: datetime | None = None  # From our database (last_login_at)
    joined_at: datetime | None = None  # From our database (created_at)


class InviteMemberRequest(BaseModel):
    """Request to invite a new team member."""

    email: EmailStr
    role: ValidatedRole = "member"


class UpdateMemberRoleRequest(BaseModel):
    """Request to update a member's role."""

    role: ValidatedRole


__all__ = [
    "TeamMemberResponse",
    "InviteMemberRequest",
    "UpdateMemberRoleRequest",
]

