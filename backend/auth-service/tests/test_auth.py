"""Integration tests for authentication routes."""

import pytest
from httpx import AsyncClient
from unittest.mock import patch, MagicMock

from app.models import User


@pytest.mark.asyncio
async def test_get_login_url(client: AsyncClient):
    """Test login URL generation."""
    with patch("app.routers.auth.get_authorization_url") as mock_auth_url:
        mock_auth_url.return_value = "https://api.workos.com/sso/authorize?..."
        
        response = await client.get("/auth/login-url")
        
        assert response.status_code == 200
        data = response.json()
        assert "authorization_url" in data
        assert data["authorization_url"].startswith("https://")


@pytest.mark.asyncio
async def test_get_login_url_with_provider(client: AsyncClient):
    """Test login URL generation with specific provider."""
    with patch("app.routers.auth.get_authorization_url") as mock_auth_url:
        mock_auth_url.return_value = "https://api.workos.com/sso/authorize?provider=GoogleOAuth"
        
        response = await client.get("/auth/login-url?provider=GoogleOAuth")
        
        assert response.status_code == 200
        mock_auth_url.assert_called_once()
        call_kwargs = mock_auth_url.call_args.kwargs
        assert call_kwargs["provider"] == "GoogleOAuth"


@pytest.mark.asyncio
async def test_auth_callback_success(client: AsyncClient, test_db, mock_workos_client):
    """Test successful authentication callback."""
    with patch("app.routers.auth.authenticate_with_code") as mock_auth, \
         patch("app.core.workos_client.client", mock_workos_client):
        
        # Mock authentication response
        mock_auth.return_value = {
            "user": mock_workos_client.user_management.get_user.return_value,
            "sealed_session": "sealed_session_token",
            "access_token": "access_token",
            "refresh_token": "refresh_token",
        }
        
        response = await client.get("/auth/callback?code=test_code")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "user_id" in data  # Response contains user_id, not full user object
        
        # Verify session cookie was set
        assert "wos-session" in response.cookies


@pytest.mark.asyncio
async def test_auth_callback_invalid_code(client: AsyncClient):
    """Test authentication callback with invalid code."""
    with patch("app.routers.auth.authenticate_with_code") as mock_auth:
        mock_auth.side_effect = ValueError("Invalid authorization code")
        
        response = await client.get("/auth/callback?code=invalid_code")
        
        assert response.status_code == 400


@pytest.mark.asyncio
async def test_logout(client: AsyncClient):
    """Test logout endpoint."""
    response = await client.post("/auth/logout")
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    
    # Verify session cookie was cleared
    assert response.cookies.get("wos-session") == "" or "wos-session" not in response.cookies


@pytest.mark.asyncio
async def test_get_current_user_without_session(client: AsyncClient):
    """Test getting current user without authentication."""
    response = await client.get("/auth/me")
    
    # Should return 401 or redirect
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_get_organizations_without_session(client: AsyncClient):
    """Test getting organizations without authentication."""
    response = await client.get("/auth/organizations")
    
    # Should return 401 or 403
    assert response.status_code in [401, 403]

