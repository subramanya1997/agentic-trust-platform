"""Health check endpoints.

This module provides health check endpoints for monitoring and orchestration.
These endpoints are used by container orchestration systems (Kubernetes, Docker)
and monitoring tools to determine service health and readiness.

Endpoints:
    - GET /health: Comprehensive health check with dependency verification
    - GET /health/live: Liveness check (service is running)
    - GET /health/ready: Readiness check (service can accept traffic)
    - GET /: Root endpoint with service information

Health Checks:
    - Database connectivity (PostgreSQL)
    - Redis connectivity
    - WorkOS circuit breaker state

Usage:
    These endpoints are typically called by:
    - Kubernetes liveness/readiness probes
    - Docker health checks
    - Load balancers for health monitoring
    - Monitoring systems (Prometheus, Datadog, etc.)
"""

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
    
    This endpoint performs health checks on all critical dependencies:
    - Database: Executes SELECT 1 query to verify connectivity
    - Redis: Sends PING command to verify connectivity
    - WorkOS Circuit Breaker: Checks circuit breaker state
    
    Response Status Codes:
        - 200: All checks passed (healthy)
        - 503: One or more dependencies unhealthy (degraded)
    
    Response Format:
        {
            "status": "healthy" | "degraded",
            "service": "agentic-trust-api",
            "version": "0.1.0",
            "checks": {
                "database": "healthy" | "unhealthy: <error>",
                "redis": "healthy" | "unhealthy: <error>",
                "workos_circuit": "closed" | "open" | "half_open"
            }
        }
    
    Health States:
        - healthy: All dependencies are operational
        - degraded: One or more dependencies are unhealthy but service can still function
    
    Example:
        >>> GET /health
        {
            "status": "healthy",
            "service": "agentic-trust-api",
            "version": "0.1.0",
            "checks": {
                "database": "healthy",
                "redis": "healthy",
                "workos_circuit": "closed"
            }
        }
    
    Note:
        This endpoint does NOT require authentication. It's designed to be
        accessible to monitoring systems and load balancers.
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
    
    This endpoint indicates whether the service process is running. It does
    NOT check dependencies - it only verifies the service itself is alive.
    
    Use Cases:
        - Kubernetes liveness probe
        - Docker health check
        - Process monitoring
    
    Response:
        - Always returns 200 if service is running
        - Does not check database, Redis, or other dependencies
        
    Returns:
        dict: Simple status response
        
    Example:
        >>> GET /health/live
        {
            "status": "alive",
            "service": "agentic-trust-api"
        }
    
    Note:
        This endpoint should be fast and lightweight. It's called frequently
        by orchestration systems to detect if the container needs restarting.
    """
    return {
        "status": "alive",
        "service": "agentic-trust-api",
    }


@router.get("/health/ready")
async def readiness_check():
    """
    Readiness check - full dependency check.
    
    This endpoint indicates whether the service is ready to accept traffic.
    It performs comprehensive health checks on all dependencies.
    
    Use Cases:
        - Kubernetes readiness probe
        - Load balancer health checks
        - Traffic routing decisions
    
    Response:
        - 200: Service is ready (all dependencies healthy)
        - 503: Service is not ready (one or more dependencies unhealthy)
    
    Returns:
        JSONResponse: Same format as /health endpoint
        
    Example:
        >>> GET /health/ready
        {
            "status": "healthy",
            "service": "agentic-trust-api",
            "version": "0.1.0",
            "checks": {
                "database": "healthy",
                "redis": "healthy",
                "workos_circuit": "closed"
            }
        }
    
    Note:
        This endpoint should be used to determine if the service can handle
        requests. If it returns 503, the service should not receive traffic.
    """
    return await health_check()


@router.get("/")
async def root():
    """
    Root endpoint with service information.
    
    This endpoint provides basic service metadata. It's useful for service
    discovery and API exploration.
    
    Returns:
        dict: Service information including:
            - name: Application name
            - version: Service version
            - docs: Link to API documentation (if debug mode enabled)
            
    Example:
        >>> GET /
        {
            "name": "Agentic Trust API",
            "version": "0.1.0",
            "docs": "/docs"  # Only in debug mode
        }
    
    Note:
        The docs field is only included when debug mode is enabled.
        In production, it will be None.
    """
    from app.config import settings

    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "docs": "/docs" if settings.debug else None,
    }

