"""Service layer with dependency injection factories.

This module provides FastAPI dependency injection factories for service classes.
These factories ensure services receive the correct database session and can be
easily injected into route handlers.

Key Features:
- Dependency injection for service classes
- Automatic database session management
- Type-safe service instantiation

Usage:
    from app.services import get_workos_service, get_audit_service
    
    @router.get("/users/me")
    async def get_me(
        service: WorkOSService = Depends(get_workos_service)
    ):
        # Service is automatically injected with db session
        user = await service.get_user_by_id("user_123")
        return user
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.audit_service import AuditService
from app.services.workos_service import WorkOSService


def get_workos_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> WorkOSService:
    """
    Dependency injection factory for WorkOSService.
    
    This factory function creates a WorkOSService instance with the current
    database session. It's used as a FastAPI dependency to inject the service
    into route handlers.
    
    The database session is automatically managed by FastAPI's dependency system:
    - Session is created when request starts
    - Session is passed to service
    - Session is closed when request completes
    
    Args:
        db: Database session from dependency injection (get_db)
        
    Returns:
        WorkOSService: Configured WorkOSService instance with database session
        
    Example:
        @router.post("/organizations")
        async def create_org(
            data: OrganizationCreate,
            service: WorkOSService = Depends(get_workos_service)
        ):
            org = await service.create_organization_with_sync(data.name)
            return org
    """
    return WorkOSService(db)


def get_audit_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> AuditService:
    """
    Dependency injection factory for AuditService.
    
    This factory function creates an AuditService instance with the current
    database session. It's used as a FastAPI dependency to inject the service
    into route handlers.
    
    Args:
        db: Database session from dependency injection (get_db)
        
    Returns:
        AuditService: Configured AuditService instance with database session
        
    Example:
        @router.get("/audit/events")
        async def list_events(
            service: AuditService = Depends(get_audit_service)
        ):
            events = await service.list_events(org_id, limit=50)
            return events
    """
    return AuditService(db)


__all__ = [
    "get_workos_service",
    "get_audit_service",
    "WorkOSService",
    "AuditService",
]
