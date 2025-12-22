"""Audit log API routes.

This module provides endpoints for querying and syncing audit logs. Audit logs
track all user actions for compliance, security, and debugging purposes.

Endpoints:
    - GET /audit/events: List audit events for current user/organization
    - POST /audit/sync: Sync audit events from WorkOS (admin only)

Key Features:
    - Pagination support for large event lists
    - User-scoped event filtering
    - Organization-scoped event filtering
    - WorkOS event syncing
    - Custom event creation support

Audit Event Sources:
    - WorkOS: Synced from WorkOS audit logs (user.login, org.create, etc.)
    - Custom: Created locally for application-specific events

Usage:
    These endpoints are used by the frontend to:
    - Display audit logs in activity/audit UI
    - Track user actions for compliance
    - Debug issues by reviewing event history
"""

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
    List audit events for the current user in their current organization.
    
    This endpoint returns a paginated list of audit events filtered by the
    current user and organization. Events are ordered by creation time
    (newest first).
    
    Authentication:
        Required (session cookie)
    
    Authorization:
        User must be a member of the organization
        
    Headers:
        X-Organization-ID: Current organization ID (required)
        
    Query Parameters:
        limit (optional): Number of events to return (1-100, default: 50)
        offset (optional): Pagination offset (default: 0)
        
    Returns:
        list[AuditEventRead]: List of audit events with:
            - id: Event ID
            - organization_id: Organization ID
            - user_id: User ID who performed the action
            - user_email: User's email
            - action: Action performed (e.g., "user.login", "agent.create")
            - target_type: Type of resource affected
            - target_id: ID of resource affected
            - target_name: Name of resource affected
            - ip_address: IP address of the request
            - user_agent: User agent string
            - source: Event source ("workos" or "custom")
            - event_metadata: Additional event data
            - occurred_at: When event occurred
            - created_at: When event was recorded
            
    Example:
        >>> GET /audit/events?limit=20&offset=0
        Headers: X-Organization-ID: org_01ABC123
        
        Response:
        [
            {
                "id": "event_01ABC123",
                "organization_id": "org_01ABC123",
                "user_id": "user_01XYZ789",
                "user_email": "john@example.com",
                "action": "user.login",
                "target_type": "user",
                "target_id": "user_01XYZ789",
                "ip_address": "192.168.1.1",
                "source": "workos",
                "event_metadata": {},
                "occurred_at": "2024-01-01T12:00:00Z",
                "created_at": "2024-01-01T12:00:00Z"
            }
        ]
    
    Error Handling:
        - 400: No organization selected
        - 500: Database error
    
    Note:
        Events are filtered by both user_id and organization_id. Users can
        only see their own events within the current organization.
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
    
    This endpoint manually triggers synchronization of audit events from WorkOS
    for the current organization. It's useful for ensuring the local database
    has the latest audit events from WorkOS.
    
    Process:
        1. Fetches audit events from WorkOS for the organization
        2. Deduplicates events (skips already synced events)
        3. Creates new audit event records in local database
        4. Returns count of newly synced events
    
    Authentication:
        Required (session cookie)
    
    Authorization:
        Admin role required only
        
    Headers:
        X-Organization-ID: Current organization ID (required)
        
    Query Parameters:
        limit (optional): Maximum events to sync (1-500, default: 100)
        
    Returns:
        dict: Sync results:
            - success: Whether sync succeeded
            - synced_count: Number of new events synced
            - message: Success message
            
    Example:
        >>> POST /audit/sync?limit=200
        Headers: X-Organization-ID: org_01ABC123
        
        Response:
        {
            "success": true,
            "synced_count": 42,
            "message": "Successfully synced 42 audit events"
        }
    
    Error Handling:
        - 400: No organization selected
        - 403: Insufficient permissions (not admin)
        - 500: Database or WorkOS API error
    
    Note:
        Events are deduplicated using WorkOS event ID stored in event_metadata.
        This prevents duplicate events from multiple syncs. Only admins can
        trigger syncs to prevent abuse.
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

