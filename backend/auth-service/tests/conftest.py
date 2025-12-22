"""Pytest configuration and fixtures for integration tests.

This module provides shared pytest fixtures and configuration for all
integration tests in the auth-service. It sets up:
- Test database with automatic schema creation/teardown
- Async HTTP test client for FastAPI endpoints
- Mock WorkOS client for external service calls
- Sample data fixtures for common test scenarios

Test Database:
    Tests use a separate PostgreSQL database (agentic_trust_test) that is
    created fresh for each test function and torn down afterward. This ensures
    test isolation and prevents data leakage between tests.

Fixtures:
    - event_loop: Session-scoped event loop for async tests
    - test_engine: Function-scoped database engine with schema management
    - test_db: Function-scoped database session with automatic rollback
    - client: Function-scoped async HTTP client for FastAPI app
    - mock_workos_client: Mock WorkOS client with pre-configured responses
    - mock_session_data: Sample session data for authenticated requests
    - sample_user_data: Sample user data dictionary
    - sample_organization_data: Sample organization data dictionary

Environment Variables:
    Test environment variables are set before importing the app to ensure
    the application uses test configuration. These include test database URLs,
    mock API keys, and debug settings.

Usage:
    import pytest
    from httpx import AsyncClient
    
    @pytest.mark.asyncio
    async def test_example(client: AsyncClient, test_db):
        response = await client.get("/health")
        assert response.status_code == 200
"""

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
    """
    Create an instance of the default event loop for the test session.
    
    This fixture ensures that all async tests share the same event loop
    within a test session, which is required for pytest-asyncio.
    
    Yields:
        asyncio.AbstractEventLoop: The event loop instance
    
    Note:
        The event loop is closed after all tests in the session complete.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """
    Create test database engine with automatic schema management.
    
    This fixture creates a fresh database engine for each test function,
    creates all tables before the test, and drops them after. This ensures
    complete test isolation.
    
    Yields:
        AsyncEngine: SQLAlchemy async engine connected to test database
    
    Note:
        The engine is disposed after the test completes to free resources.
    """
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
    """
    Create test database session with automatic rollback.
    
    This fixture provides a database session for each test. All changes
    are automatically rolled back after the test completes, ensuring
    no data persists between tests.
    
    Args:
        test_engine: The test database engine fixture
    
    Yields:
        AsyncSession: SQLAlchemy async session
    
    Note:
        The session is rolled back after the test, so no manual cleanup
        is required. However, you can still commit within a test if needed.
    """
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
    """
    Create async HTTP test client for FastAPI application.
    
    This fixture provides an httpx AsyncClient configured to make requests
    against the FastAPI application. It's used for integration testing
    of API endpoints.
    
    Yields:
        AsyncClient: httpx async client configured for the FastAPI app
    
    Example:
        async def test_endpoint(client: AsyncClient):
            response = await client.get("/health")
            assert response.status_code == 200
    """
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest.fixture
def mock_workos_client():
    """
    Create mock WorkOS client with pre-configured responses.
    
    This fixture provides a MagicMock configured to simulate WorkOS API
    responses. It includes mock user, organization, and membership objects
    with realistic test data.
    
    Returns:
        MagicMock: Mock WorkOS client with configured methods:
            - user_management.get_user: Returns mock user
            - organizations.get_organization: Returns mock organization
            - user_management.list_organization_memberships: Returns mock memberships
    
    Mock Data:
        - User: user_test123, test@example.com, Test User
        - Organization: org_test123, Test Organization
        - Membership: mem_test123, admin role, active status
    
    Example:
        def test_with_workos(mock_workos_client):
            user = mock_workos_client.user_management.get_user("user_123")
            assert user.email == "test@example.com"
    """
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
    """
    Create mock session data for authenticated requests.
    
    This fixture provides a SessionData object that simulates an authenticated
    user session. It's useful for testing endpoints that require authentication.
    
    Returns:
        SessionData: Mock session data with:
            - User: user_test123, test@example.com, Test User
            - Organization: org_test123
            - Role: admin
            - No impersonator
    
    Example:
        async def test_authenticated_endpoint(client, mock_session_data):
            # Use mock_session_data to simulate authenticated request
            pass
    """
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
    """
    Sample user data dictionary for testing.
    
    Returns:
        dict: Dictionary with user fields:
            - id: user_test123
            - email: test@example.com
            - first_name: Test
            - last_name: User
            - email_verified: True
            - avatar_url: None
    
    Example:
        def test_create_user(sample_user_data):
            user = User(**sample_user_data)
            assert user.email == "test@example.com"
    """
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
    """
    Sample organization data dictionary for testing.
    
    Returns:
        dict: Dictionary with organization fields:
            - id: org_test123
            - name: Test Organization
            - slug: test-organization
            - plan: free
    
    Example:
        def test_create_org(sample_organization_data):
            org = Organization(**sample_organization_data)
            assert org.name == "Test Organization"
    """
    return {
        "id": "org_test123",
        "name": "Test Organization",
        "slug": "test-organization",
        "plan": "free",
    }

