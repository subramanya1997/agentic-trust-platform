"""Service layer with dependency injection factories."""

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
    
    Args:
        db: Database session from dependency injection
        
    Returns:
        Configured WorkOSService instance
    """
    return WorkOSService(db)


def get_audit_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> AuditService:
    """
    Dependency injection factory for AuditService.
    
    Args:
        db: Database session from dependency injection
        
    Returns:
        Configured AuditService instance
    """
    return AuditService(db)


__all__ = [
    "get_workos_service",
    "get_audit_service",
    "WorkOSService",
    "AuditService",
]
