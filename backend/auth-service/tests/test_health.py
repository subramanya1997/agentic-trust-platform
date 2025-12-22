"""Tests for health check endpoint.

This module contains tests for the health check endpoints used for
monitoring and deployment orchestration. Health checks verify that
the service is running and its dependencies are available.

Test Coverage:
    - Basic health check endpoint response
    - Health status values (healthy, degraded)
    - Service identification
    - Comprehensive health checks format

Health Check Endpoints:
    - GET /health: Comprehensive health check with dependency status
    - GET /health/live: Liveness probe (always returns 200 if service is running)
    - GET /health/ready: Readiness probe (checks database connectivity)

Response Format:
    {
        "status": "healthy" | "degraded",
        "service": "agentic-trust-api",
        "checks": {
            "database": "ok" | "degraded" | "down",
            "redis": "ok" | "degraded" | "down",
            ...
        }
    }

Note:
    Health checks are critical for Kubernetes deployments and load balancers
    to determine if a service instance should receive traffic.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    """Create async test client."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health check endpoint returns status."""
    response = await client.get("/health")
    # Should return 200 if healthy or 503 if degraded
    assert response.status_code in [200, 503]
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["service"] == "agentic-trust-api"
    assert "checks" in data  # New comprehensive health check format

