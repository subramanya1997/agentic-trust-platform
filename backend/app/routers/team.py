"""Team management routes."""

import workos
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import Permission, require_permission
from app.database import get_db
from app.dependencies import get_current_org, get_current_user
from app.models import Organization, User
from app.services.workos_service import WorkOSService

router = APIRouter()


class TeamMember(BaseModel):
    """Team member information."""

    id: str
    user_id: str
    email: str
    name: str | None
    role: str
    status: str
    avatar_url: str | None = None


class InviteMemberRequest(BaseModel):
    """Request to invite a new team member."""

    email: EmailStr
    role: str = "member"


class UpdateMemberRoleRequest(BaseModel):
    """Request to update a member's role."""

    role: str


@router.get("/members", response_model=list[TeamMember])
async def list_team_members(
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_permission(Permission.TEAM_VIEW)),
):
    """List all members of the current organization."""
    memberships = workos.client.user_management.list_organization_memberships(
        organization_id=org.id,
        limit=100,
    )

    members = []
    service = WorkOSService(db)

    for m in memberships.data:
        try:
            workos_user = workos.client.user_management.get_user(m.user_id)
            user = await service.sync_user(workos_user)

            role = (
                m.role.value if hasattr(m.role, "value") else str(m.role) if m.role else "member"
            )
            member_status = (
                m.status.value
                if hasattr(m.status, "value")
                else str(m.status) if m.status else "active"
            )

            members.append(
                TeamMember(
                    id=m.id,
                    user_id=m.user_id,
                    email=user.email,
                    name=user.display_name,
                    role=role,
                    status=member_status,
                    avatar_url=user.avatar_url,
                )
            )
        except Exception:
            continue

    return members


@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite_member(
    data: InviteMemberRequest,
    org: Organization = Depends(get_current_org),
    user: User = Depends(get_current_user),
    _: str = Depends(require_permission(Permission.TEAM_INVITE)),
):
    """Invite a new member to the organization."""
    try:
        invitation = workos.client.user_management.send_invitation(
            email=data.email,
            organization_id=org.id,
            role=data.role,
            inviter_user_id=user.id,
        )

        return {
            "success": True,
            "invitation_id": invitation.id,
            "email": data.email,
            "message": f"Invitation sent to {data.email}",
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to send invitation: {e!s}",
        )


@router.patch("/members/{membership_id}/role")
async def update_member_role(
    membership_id: str,
    data: UpdateMemberRoleRequest,
    org: Organization = Depends(get_current_org),
    _: str = Depends(require_permission(Permission.TEAM_MANAGE)),
):
    """Update a team member's role."""
    try:
        workos.client.user_management.update_organization_membership(
            organization_membership_id=membership_id,
            role=data.role,
        )

        return {
            "success": True,
            "membership_id": membership_id,
            "new_role": data.role,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update role: {e!s}",
        )


@router.delete("/members/{membership_id}")
async def remove_member(
    membership_id: str,
    org: Organization = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    _: str = Depends(require_permission(Permission.TEAM_REMOVE)),
):
    """Remove a member from the organization."""
    try:
        membership = workos.client.user_management.get_organization_membership(membership_id)

        if membership.user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove yourself from the organization",
            )

        workos.client.user_management.delete_organization_membership(membership_id)

        return {
            "success": True,
            "message": "Member removed from organization",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to remove member: {e!s}",
        )


@router.get("/invitations")
async def list_invitations(
    org: Organization = Depends(get_current_org),
    _: str = Depends(require_permission(Permission.TEAM_VIEW)),
):
    """List pending invitations for the organization."""
    try:
        invitations = workos.client.user_management.list_invitations(
            organization_id=org.id,
        )

        return [
            {
                "id": inv.id,
                "email": inv.email,
                "state": inv.state.value if hasattr(inv.state, "value") else str(inv.state),
                "created_at": inv.created_at,
                "expires_at": inv.expires_at,
            }
            for inv in invitations.data
        ]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to list invitations: {e!s}",
        )


@router.delete("/invitations/{invitation_id}")
async def revoke_invitation(
    invitation_id: str,
    org: Organization = Depends(get_current_org),
    _: str = Depends(require_permission(Permission.TEAM_MANAGE)),
):
    """Revoke a pending invitation."""
    try:
        workos.client.user_management.revoke_invitation(invitation_id)

        return {
            "success": True,
            "message": "Invitation revoked",
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to revoke invitation: {e!s}",
        )

