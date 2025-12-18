"""Health check endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "agentic-trust-api",
        "version": "0.1.0",
    }


@router.get("/")
async def root():
    """Root endpoint."""
    from app.config import settings

    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "docs": "/docs" if settings.debug else None,
    }

