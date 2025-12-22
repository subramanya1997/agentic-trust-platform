"""Tests for health check endpoint."""

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

