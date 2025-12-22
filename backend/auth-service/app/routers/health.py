"""Health check endpoints."""

import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from redis import asyncio as aioredis
from sqlalchemy import text

from app.config import settings
from app.core.circuit_breaker import get_circuit_state
from app.database import engine

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/health",
    summary="Health Check",
    description="Comprehensive health check with dependency verification",
    responses={
        200: {
            "description": "Service is healthy",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "service": "agentic-trust-api",
                        "version": "0.1.0",
                        "checks": {
                            "database": "healthy",
                            "redis": "healthy"
                        }
                    }
                }
            }
        },
        503: {
            "description": "Service is degraded (one or more dependencies unhealthy)",
            "content": {
                "application/json": {
                    "example": {
                        "status": "degraded",
                        "service": "agentic-trust-api",
                        "version": "0.1.0",
                        "checks": {
                            "database": "unhealthy: connection refused",
                            "redis": "healthy"
                        }
                    }
                }
            }
        },
    },
)
async def health_check():
    """
    Comprehensive health check endpoint.
    
    Checks:
    - Service availability (always passes)
    - Database connectivity (SELECT 1 query)
    - Redis connectivity (PING command)
    
    Returns 200 if all checks pass, 503 if any dependency is unhealthy.
    """
    checks = {
        "status": "healthy",
        "service": "agentic-trust-api",
        "version": "0.1.0",
        "checks": {},
    }
    
    # Database health check
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            await conn.commit()
        checks["checks"]["database"] = "healthy"
    except Exception as e:
        logger.error("Database health check failed", exc_info=True, extra={"error": str(e)})
        checks["checks"]["database"] = f"unhealthy: {str(e)[:100]}"
        checks["status"] = "degraded"
    
    # Redis health check
    try:
        redis = aioredis.from_url(settings.redis_url, decode_responses=True)
        await redis.ping()
        await redis.aclose()
        checks["checks"]["redis"] = "healthy"
    except Exception as e:
        logger.error("Redis health check failed", exc_info=True, extra={"error": str(e)})
        checks["checks"]["redis"] = f"unhealthy: {str(e)[:100]}"
        checks["status"] = "degraded"
    
    # Circuit breaker health check
    try:
        circuit_state = get_circuit_state("workos")
        checks["checks"]["workos_circuit"] = circuit_state
        # Circuit being open is a degraded state but not a failure
        if circuit_state == "open":
            checks["status"] = "degraded"
    except Exception as e:
        logger.error("Circuit breaker health check failed", exc_info=True, extra={"error": str(e)})
        checks["checks"]["workos_circuit"] = "unknown"
    
    status_code = 200 if checks["status"] == "healthy" else 503
    return JSONResponse(content=checks, status_code=status_code)


@router.get("/health/live")
async def liveness_check():
    """
    Liveness check - simple endpoint for container health.
    
    Returns 200 if the service is running (doesn't check dependencies).
    """
    return {
        "status": "alive",
        "service": "agentic-trust-api",
    }


@router.get("/health/ready")
async def readiness_check():
    """
    Readiness check - full dependency check.
    
    Checks all dependencies are available before accepting traffic.
    Returns 200 if ready, 503 if not ready.
    """
    return await health_check()


@router.get("/")
async def root():
    """Root endpoint."""
    from app.config import settings

    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "docs": "/docs" if settings.debug else None,
    }

