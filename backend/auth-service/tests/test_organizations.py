"""Integration tests for organization management routes."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_organizations_unauthorized(client: AsyncClient):
    """Test listing organizations without authentication."""
    response = await client.get("/organizations")
    
    # Should require authentication
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_create_organization_unauthorized(client: AsyncClient):
    """Test creating organization without authentication."""
    response = await client.post(
        "/organizations",
        json={"name": "New Organization"}
    )
    
    # Should require authentication
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_get_organization_unauthorized(client: AsyncClient):
    """Test getting organization without authentication."""
    response = await client.get("/organizations/org_123")
    
    # Should require authentication
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_update_organization_unauthorized(client: AsyncClient):
    """Test updating organization without authentication."""
    response = await client.patch(
        "/organizations/current",
        json={"name": "Updated Name"}
    )
    
    # Should require authentication
    assert response.status_code in [401, 403]

