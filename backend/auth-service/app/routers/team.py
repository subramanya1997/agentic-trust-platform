"""Team management routes."""

import logging
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.core import workos_client
from app.core.exceptions import DatabaseError, WorkOSError
from app.core.permissions import require_role
from app.core.roles import normalize_role
from app.dependencies import get_current_org, get_current_user
from app.models import Organization, User
from app.schemas.team import (
    InviteMemberRequest,
    TeamMemberResponse,
    UpdateMemberRoleRequest,
)
from app.services import WorkOSService, get_workos_service

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize limiter for rate limiting
limiter = Limiter(key_func=get_remote_address)


@router.get("/members", response_model=list[TeamMemberResponse])
async def list_team_members(
    service: Annotated[WorkOSService, Depends(get_workos_service)],
    org: Organization = Depends(get_current_org),
    _: str = Depends(require_role(["admin", "member", "viewer"])),
):
    """
    List all members of the current organization.
    
    Uses batch fetching to avoid N+1 query problem.
    """
    memberships = workos_client.list_organization_memberships(
        organization_id=org.id,
        limit=100,
    )

    # Batch fetch all users from database first (avoids N+1 queries)
    user_ids = [m.user_id for m in memberships.data]
    users_dict = await service.get_users_by_ids(user_ids)

    members = []

    for m in memberships.data:
        try:
            # Check if user exists in local database
            user = users_dict.get(m.user_id)
            
            # If not in local DB, fetch from WorkOS and sync
            if not user:
                try:
                    workos_user = workos_client.get_user(m.user_id)
                    user = await service.sync_user(workos_user)
                except (httpx.HTTPStatusError, httpx.RequestError) as e:
                    logger.warning(
                        "Failed to fetch user data from WorkOS",
                        extra={"user_id": m.user_id, "error": str(e)},
                    )
                    continue

            # Normalize role to consistent format
            role_slug, role_display = normalize_role(m.role)
            
            member_status = (
                m.status.value
                if hasattr(m.status, "value")
                else str(m.status) if m.status else "active"
            )

            members.append(
                TeamMemberResponse(
                    id=m.id,
                    user_id=m.user_id,
                    email=user.email,
                    name=user.display_name,
                    role=role_slug,  # Always lowercase slug
                    role_display_name=role_display,  # Capitalized for display
                    status=member_status,
                    avatar_url=user.avatar_url,
                    last_active=user.last_login_at,  # From our database
                    joined_at=user.created_at,  # From our database
                )
            )
        except (SQLAlchemyError, DatabaseError) as e:
            logger.warning(
                "Database error processing team member",
                extra={"user_id": m.user_id, "error": str(e)},
            )
            continue

    return members


@router.post(
    "/invite",
    status_code=status.HTTP_201_CREATED,
    summary="Invite Team Member",
    description="Send an invitation email to a user to join the organization",
    responses={
        201: {
            "description": "Invitation sent successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "invitation_id": "inv_123abc",
                        "email": "newuser@example.com",
                        "message": "Invitation sent to newuser@example.com"
                    }
                }
            }
        },
        400: {"description": "Invalid request or WorkOS API error"},
        403: {"description": "Insufficient permissions (requires admin or member role)"},
        429: {"description": "Rate limit exceeded (20 invitations/hour)"},
        503: {"description": "Service temporarily unavailable"},
    },
)
@limiter.limit("20/hour")
async def invite_member(
    request: Request,
    data: InviteMemberRequest,
    org: Organization = Depends(get_current_org),
    user: User = Depends(get_current_user),
    _: str = Depends(require_role(["admin", "member"])),
):
    """
    Invite a new member to the organization.
    
    Requires `admin` or `member` role. The invited user will receive an email
    with a link to join the organization.
    
    Rate limited to 20 invitations per hour per IP address.
    """
    try:
        invitation = workos_client.send_invitation(
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
    except httpx.HTTPStatusError as e:
        logger.error(
            "WorkOS API error sending invitation",
            exc_info=True,
            extra={"email": data.email, "organization_id": org.id, "status": e.response.status_code},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to send invitation. Please try again." if not settings.debug else f"Failed to send invitation: {e!s}",
        )
    except httpx.RequestError as e:
        logger.error(
            "Network error sending invitation",
            exc_info=True,
            extra={"email": data.email, "organization_id": org.id},
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again later.",
        )


@router.patch("/members/{membership_id}/role")
async def update_member_role(
    membership_id: str,
    data: UpdateMemberRoleRequest,
    org: Organization = Depends(get_current_org),
    _: str = Depends(require_role(["admin"])),
):
    """Update a team member's role."""
    try:
        workos_client.update_organization_membership(
            membership_id=membership_id,
            role=data.role,
        )

        return {
            "success": True,
            "membership_id": membership_id,
            "new_role": data.role,
        }
    except httpx.HTTPStatusError as e:
        logger.error(
            "WorkOS API error updating member role",
            exc_info=True,
            extra={"membership_id": membership_id, "new_role": data.role, "status": e.response.status_code},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update role. Please try again." if not settings.debug else f"Failed to update role: {e!s}",
        )
    except httpx.RequestError as e:
        logger.error(
            "Network error updating member role",
            exc_info=True,
            extra={"membership_id": membership_id, "new_role": data.role},
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again later.",
        )


@router.delete("/members/{membership_id}")
async def remove_member(
    membership_id: str,
    org: Organization = Depends(get_current_org),
    current_user: User = Depends(get_current_user),
    _: str = Depends(require_role(["admin"])),
):
    """Remove a member from the organization."""
    try:
        membership = workos_client.get_organization_membership(membership_id)

        if membership.user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove yourself from the organization",
            )

        workos_client.delete_organization_membership(membership_id)

        return {
            "success": True,
            "message": "Member removed from organization",
        }

    except HTTPException:
        raise
    except httpx.HTTPStatusError as e:
        logger.error(
            "WorkOS API error removing member",
            exc_info=True,
            extra={"membership_id": membership_id, "status": e.response.status_code},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to remove member. Please try again." if not settings.debug else f"Failed to remove member: {e!s}",
        )
    except httpx.RequestError as e:
        logger.error(
            "Network error removing member",
            exc_info=True,
            extra={"membership_id": membership_id},
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again later.",
        )


@router.get("/invitations")
async def list_invitations_endpoint(
    service: Annotated[WorkOSService, Depends(get_workos_service)],
    org: Organization = Depends(get_current_org),
    _: str = Depends(require_role(["admin", "member", "viewer"])),
):
    """List pending invitations for the organization."""
    try:
        invitations = workos_client.list_invitations(organization_id=org.id)
        
        result = []
        for inv in invitations.data:
            # Get inviter name if available
            inviter_name = None
            if hasattr(inv, "inviter_user_id") and inv.inviter_user_id:
                try:
                    inviter_user = await service.get_user_by_id(inv.inviter_user_id)
                    if inviter_user:
                        inviter_name = inviter_user.display_name
                except SQLAlchemyError as e:
                    logger.warning(
                        "Database error fetching inviter",
                        extra={"inviter_user_id": inv.inviter_user_id, "error": str(e)},
                    )
            
            result.append({
                "id": inv.id,
                "email": inv.email,
                "role": inv.role if hasattr(inv, "role") and inv.role else "member",
                "state": inv.state.value if hasattr(inv.state, "value") else str(inv.state),
                "created_at": inv.created_at,
                "expires_at": inv.expires_at,
                "invited_by": inviter_name,
            })
        
        return result
    except httpx.HTTPStatusError as e:
        logger.error(
            "WorkOS API error listing invitations",
            exc_info=True,
            extra={"organization_id": org.id, "status": e.response.status_code},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to list invitations. Please try again." if not settings.debug else f"Failed to list invitations: {e!s}",
        )
    except httpx.RequestError as e:
        logger.error(
            "Network error listing invitations",
            exc_info=True,
            extra={"organization_id": org.id},
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again later.",
        )


@router.post("/invitations/{invitation_id}/resend")
async def resend_invitation_endpoint(
    invitation_id: str,
    org: Organization = Depends(get_current_org),
    _: str = Depends(require_role(["admin", "member"])),
):
    """Resend a pending invitation."""
    try:
        workos_client.resend_invitation(invitation_id)

        return {
            "success": True,
            "message": "Invitation resent successfully",
        }
    except httpx.HTTPStatusError as e:
        logger.error(
            "WorkOS API error resending invitation",
            exc_info=True,
            extra={"invitation_id": invitation_id, "status": e.response.status_code},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to resend invitation. Please try again." if not settings.debug else f"Failed to resend invitation: {e!s}",
        )
    except httpx.RequestError as e:
        logger.error(
            "Network error resending invitation",
            exc_info=True,
            extra={"invitation_id": invitation_id},
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again later.",
        )


@router.delete("/invitations/{invitation_id}")
async def revoke_invitation_endpoint(
    invitation_id: str,
    org: Organization = Depends(get_current_org),
    _: str = Depends(require_role(["admin"])),
):
    """Revoke a pending invitation."""
    try:
        workos_client.revoke_invitation(invitation_id)

        return {
            "success": True,
            "message": "Invitation revoked",
        }
    except httpx.HTTPStatusError as e:
        logger.error(
            "WorkOS API error revoking invitation",
            exc_info=True,
            extra={"invitation_id": invitation_id, "status": e.response.status_code},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to revoke invitation. Please try again." if not settings.debug else f"Failed to revoke invitation: {e!s}",
        )
    except httpx.RequestError as e:
        logger.error(
            "Network error revoking invitation",
            exc_info=True,
            extra={"invitation_id": invitation_id},
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again later.",
        )

