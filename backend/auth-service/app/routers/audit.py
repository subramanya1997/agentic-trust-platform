"""Audit log API routes."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.session import SessionData
from app.dependencies import get_current_role, get_session
from app.models import AuditEventRead
from app.services import AuditService, get_audit_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/events")
async def list_audit_events(
    session: Annotated[SessionData, Depends(get_session)],
    service: Annotated[AuditService, Depends(get_audit_service)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[AuditEventRead]:
    """
    List audit events for the current user.

    Returns paginated list of audit events for the authenticated user
    in their current organization.
    """
    if not session.organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No organization selected",
        )
    
    try:
        events = await service.list_user_events(
            organization_id=session.organization_id,
            user_id=session.user.id,
            limit=limit,
            offset=offset,
        )

        return [
            AuditEventRead(
                id=event.id,
                organization_id=event.organization_id,
                user_id=event.user_id,
                user_email=event.user_email,
                action=event.action,
                target_type=event.target_type,
                target_id=event.target_id,
                target_name=event.target_name,
                ip_address=event.ip_address,
                user_agent=event.user_agent,
                source=event.source,
                event_metadata=event.event_metadata,
                occurred_at=event.occurred_at,
                created_at=event.created_at,
            )
            for event in events
        ]
    except Exception as e:
        logger.error(f"Failed to list audit events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve audit events",
        )


@router.post("/sync")
async def sync_audit_events(
    session: Annotated[SessionData, Depends(get_session)],
    role: Annotated[str, Depends(get_current_role)],
    service: Annotated[AuditService, Depends(get_audit_service)],
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
) -> dict:
    """
    Sync audit events from WorkOS to local database.

    Admin-only endpoint to trigger synchronization of audit logs
    from WorkOS for the current organization.
    """
    # Only admins can trigger sync
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can sync audit events",
        )

    if not session.organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No organization selected",
        )
    
    try:
        synced_count = await service.sync_workos_events(
            organization_id=session.organization_id,
            limit=limit,
        )

        return {
            "success": True,
            "synced_count": synced_count,
            "message": f"Successfully synced {synced_count} audit events",
        }
    except Exception as e:
        logger.error(f"Failed to sync audit events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sync audit events from WorkOS",
        )

