"""Team management request and response schemas.

This module defines Pydantic schemas for team management API requests and responses.
These schemas handle team member invitations, role updates, and member information.

Schemas:
    - TeamMemberResponse: Team member information in API responses
    - InviteMemberRequest: Request to invite a new team member
    - UpdateMemberRoleRequest: Request to update a member's role

Validation:
    - Email addresses are validated (RFC 5322 format)
    - Roles are restricted to allowed values (admin, member, viewer)

Usage:
    @router.get("/team/members", response_model=list[TeamMemberResponse])
    async def list_members(...):
        ...
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.core.validators import ValidatedRole


class TeamMemberResponse(BaseModel):
    """
    Team member information in API responses.
    
    This schema represents a team member with their role, status, and activity
    information. It combines data from WorkOS (membership) and local database
    (user details, login tracking).
    
    Attributes:
        id (str): Membership ID (WorkOS organization membership ID)
        user_id (str): User ID (WorkOS user ID)
        email (str): User's email address
        name (str | None): User's display name (first + last name)
        role (str): User's role slug ("admin", "member", "viewer")
        role_display_name (str): Human-readable role name ("Admin", "Member", "Viewer")
        status (str): Membership status ("active", "pending", "inactive")
        avatar_url (str | None): URL to user's avatar/profile picture
        last_active (datetime | None): Last login timestamp (from local database)
        joined_at (datetime | None): When user joined organization (from local database)
        
    Example:
        {
            "id": "membership_01ABC123",
            "user_id": "user_01XYZ789",
            "email": "john@example.com",
            "name": "John Doe",
            "role": "admin",
            "role_display_name": "Admin",
            "status": "active",
            "avatar_url": "https://example.com/avatar.jpg",
            "last_active": "2024-01-01T12:00:00Z",
            "joined_at": "2023-12-01T10:00:00Z"
        }
    """

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
    """
    Request to invite a new team member.
    
    This schema is used when inviting a user to join an organization.
    The user will receive an email invitation from WorkOS.
    
    Attributes:
        email (EmailStr): Email address of the user to invite
            - Validated as RFC 5322 compliant email
            - Normalized to lowercase
        role (ValidatedRole): Role to assign to the new member (default: "member")
            - Must be one of: "admin", "member", "viewer"
            - Normalized to lowercase
            
    Example:
        {
            "email": "newuser@example.com",
            "role": "member"
        }
        
    Validation:
        - email: Valid email format, required
        - role: Must be "admin", "member", or "viewer" (default: "member")
    """

    email: EmailStr
    role: ValidatedRole = "member"


class UpdateMemberRoleRequest(BaseModel):
    """
    Request to update a member's role.
    
    This schema is used when changing a team member's role in an organization.
    Only admins can update roles.
    
    Attributes:
        role (ValidatedRole): New role to assign
            - Must be one of: "admin", "member", "viewer"
            - Normalized to lowercase
            
    Example:
        {
            "role": "admin"
        }
        
    Validation:
        - role: Must be "admin", "member", or "viewer" (required)
    """

    role: ValidatedRole


__all__ = [
    "TeamMemberResponse",
    "InviteMemberRequest",
    "UpdateMemberRoleRequest",
]

