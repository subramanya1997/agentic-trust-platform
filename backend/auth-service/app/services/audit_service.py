"""Audit log service for syncing and querying audit events."""

import logging
from datetime import datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import workos_client
from app.models import AuditEvent, AuditEventCreate

logger = logging.getLogger(__name__)


class AuditService:
    """Service for syncing and querying audit logs."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def sync_workos_events(
        self,
        organization_id: str,
        limit: int = 100,
    ) -> int:
        """
        Sync audit log events from WorkOS to local database.

        Args:
            organization_id: The WorkOS organization ID
            limit: Maximum number of events to fetch

        Returns:
            Number of new events synced
        """
        try:
            # Fetch events from WorkOS
            events_response = workos_client.list_audit_log_events(
                organization_id=organization_id,
                limit=limit,
            )

            if not hasattr(events_response, "data") or not events_response.data:
                logger.info(f"No audit events found for organization {organization_id}")
                return 0

            synced_count = 0

            for workos_event in events_response.data:
                # Check if event already exists by creating a deterministic ID
                # from WorkOS event ID if available, or from event properties
                event_id = getattr(workos_event, "id", None)
                
                if event_id:
                    # Check if we already have this event
                    stmt = select(AuditEvent).where(
                        AuditEvent.event_metadata["workos_id"].as_string() == event_id
                    )
                    result = await self.db.execute(stmt)
                    existing = result.scalar_one_or_none()
                    
                    if existing:
                        continue

                # Extract event data
                actor = getattr(workos_event, "actor", {})
                if isinstance(actor, dict):
                    actor_id = actor.get("id", "")
                    actor_name = actor.get("name", "")
                else:
                    actor_id = getattr(actor, "id", "")
                    actor_name = getattr(actor, "name", "")

                targets = getattr(workos_event, "targets", [])
                target_type = None
                target_id = None
                target_name = None
                
                if targets and len(targets) > 0:
                    target = targets[0]
                    if isinstance(target, dict):
                        target_type = target.get("type")
                        target_id = target.get("id")
                        target_name = target.get("name")
                    else:
                        target_type = getattr(target, "type", None)
                        target_id = getattr(target, "id", None)
                        target_name = getattr(target, "name", None)

                context = getattr(workos_event, "context", {})
                if isinstance(context, dict):
                    ip_address = context.get("location")
                    user_agent = context.get("user_agent")
                else:
                    ip_address = getattr(context, "location", None)
                    user_agent = getattr(context, "user_agent", None)

                # Get occurred_at timestamp
                occurred_at_str = getattr(workos_event, "occurred_at", None)
                if occurred_at_str:
                    if isinstance(occurred_at_str, str):
                        occurred_at = datetime.fromisoformat(occurred_at_str.replace("Z", "+00:00"))
                    else:
                        occurred_at = occurred_at_str
                else:
                    occurred_at = datetime.utcnow()

                # Build event_metadata
                event_metadata = {
                    "workos_id": event_id or str(uuid4()),
                }
                
                # Add any additional metadata from WorkOS
                workos_metadata = getattr(workos_event, "metadata", {})
                if workos_metadata:
                    event_metadata["workos_metadata"] = workos_metadata if isinstance(workos_metadata, dict) else {}

                # Create audit event
                audit_event = AuditEvent(
                    id=uuid4(),
                    organization_id=organization_id,
                    user_id=actor_id,
                    user_email=actor_name,  # WorkOS may use name/email interchangeably
                    action=getattr(workos_event, "action", "unknown"),
                    target_type=target_type,
                    target_id=target_id,
                    target_name=target_name,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    event_metadata=event_metadata,
                    occurred_at=occurred_at,
                    source="workos",
                )

                self.db.add(audit_event)
                synced_count += 1

            await self.db.commit()
            logger.info(f"Synced {synced_count} new audit events for organization {organization_id}")
            return synced_count

        except Exception as e:
            logger.error(f"Failed to sync audit events: {e}")
            await self.db.rollback()
            return 0

    async def list_user_events(
        self,
        organization_id: str,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> list[AuditEvent]:
        """
        List audit events for a specific user in an organization.

        Args:
            organization_id: The organization ID
            user_id: The user ID
            limit: Maximum number of events to return
            offset: Number of events to skip

        Returns:
            List of audit events
        """
        stmt = (
            select(AuditEvent)
            .where(
                AuditEvent.organization_id == organization_id,
                AuditEvent.user_id == user_id,
            )
            .order_by(AuditEvent.occurred_at.desc())
            .limit(limit)
            .offset(offset)
        )

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_custom_event(
        self,
        event_data: AuditEventCreate,
    ) -> AuditEvent:
        """
        Create a custom audit event.

        Args:
            event_data: The audit event data

        Returns:
            Created audit event
        """
        audit_event = AuditEvent(
            id=uuid4(),
            organization_id=event_data.organization_id,
            user_id=event_data.user_id,
            user_email=event_data.user_email,
            action=event_data.action,
            target_type=event_data.target_type,
            target_id=event_data.target_id,
            target_name=event_data.target_name,
            ip_address=event_data.ip_address,
            user_agent=event_data.user_agent,
            event_metadata=event_data.event_metadata,
            occurred_at=event_data.occurred_at,
            source=event_data.source,
        )

        self.db.add(audit_event)
        await self.db.commit()
        await self.db.refresh(audit_event)

        logger.info(f"Created custom audit event: {event_data.action} for user {event_data.user_id}")
        return audit_event

