"""Integration tests for organization management routes.

This module contains integration tests for organization management endpoints.
These tests verify authentication requirements and basic endpoint functionality.

Test Coverage:
    - Listing organizations (requires authentication)
    - Creating organizations (requires authentication)
    - Retrieving organization details (requires authentication)
    - Updating organization details (requires authentication)

Authentication:
    All organization endpoints require authentication. Unauthenticated requests
    should return 401 Unauthorized or 403 Forbidden status codes.

Endpoints Tested:
    - GET /organizations: List user's organizations
    - POST /organizations: Create new organization
    - GET /organizations/{org_id}: Get organization details
    - PATCH /organizations/current: Update current organization

Note:
    These tests focus on authentication requirements. Full integration tests
    with authenticated sessions would require additional setup with mock
    WorkOS sessions or test tokens.
"""

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

