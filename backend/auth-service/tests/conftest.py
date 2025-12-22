"""Pytest configuration and fixtures for integration tests."""

import asyncio
import logging
import os
from pathlib import Path
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

# Set test environment variables before importing app
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://agentic:agentic_dev_password@localhost:5432/agentic_trust_test")
os.environ.setdefault("WORKOS_API_KEY", "test_key_at_least_32_characters_long")
os.environ.setdefault("WORKOS_CLIENT_ID", "test_client_32_characters_long")
os.environ.setdefault("WORKOS_COOKIE_PASSWORD", "test_cookie_password_32_chars_minimum")
os.environ.setdefault("ENCRYPTION_KEY", "test_encryption_key_32_chars_minimum")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("DEBUG", "true")

# Mock the logging setup to avoid file path issues in tests
with patch("shared.log_config.setup_logging"):
    # Configure basic logging for tests
    logging.basicConfig(level=logging.INFO)
    from app.main import app


# Test database URL
TEST_DATABASE_URL = "postgresql+asyncpg://agentic:agentic_dev_password@localhost:5432/agentic_trust_test"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """Create test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
    )
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    yield engine
    
    # Drop all tables after test
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    async_session_maker = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with async_session_maker() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Create async test client."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest.fixture
def mock_workos_client():
    """Create mock WorkOS client."""
    mock = MagicMock()
    
    # Mock user object
    mock_user = MagicMock()
    mock_user.id = "user_test123"
    mock_user.email = "test@example.com"
    mock_user.first_name = "Test"
    mock_user.last_name = "User"
    mock_user.email_verified = True
    mock_user.profile_picture_url = None
    
    # Mock organization
    mock_org = MagicMock()
    mock_org.id = "org_test123"
    mock_org.name = "Test Organization"
    
    # Mock membership
    mock_membership = MagicMock()
    mock_membership.id = "mem_test123"
    mock_membership.user_id = "user_test123"
    mock_membership.organization_id = "org_test123"
    mock_membership.role = "admin"
    mock_membership.status = "active"
    
    # Configure mock methods
    mock.user_management.get_user.return_value = mock_user
    mock.organizations.get_organization.return_value = mock_org
    mock.user_management.list_organization_memberships.return_value = MagicMock(
        data=[mock_membership]
    )
    
    return mock


@pytest.fixture
def mock_session_data():
    """Create mock session data for authenticated requests."""
    from app.core.session import SessionData, SessionUser
    
    user = SessionUser(
        id="user_test123",
        email="test@example.com",
        first_name="Test",
        last_name="User",
        email_verified=True,
        profile_picture_url=None,
    )
    
    return SessionData(
        user=user,
        organization_id="org_test123",
        role="admin",
        impersonator=None,
    )


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "id": "user_test123",
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "email_verified": True,
        "avatar_url": None,
    }


@pytest.fixture
def sample_organization_data():
    """Sample organization data for testing."""
    return {
        "id": "org_test123",
        "name": "Test Organization",
        "slug": "test-organization",
        "plan": "free",
    }

