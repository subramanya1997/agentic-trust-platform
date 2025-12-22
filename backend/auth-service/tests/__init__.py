"""Test suite for Agentic Trust API.

This package contains all tests for the auth-service. Tests are organized
by functionality:

- conftest.py: Shared fixtures and test configuration
- test_auth.py: Authentication endpoint tests
- test_circuit_breaker.py: Circuit breaker pattern tests
- test_exception_handler.py: Exception handling middleware tests
- test_health.py: Health check endpoint tests
- test_organizations.py: Organization management tests
- test_team.py: Team management tests
- test_validators.py: Input validation and sanitization tests

Running Tests:
    # Run all tests
    pytest
    
    # Run specific test file
    pytest tests/test_auth.py
    
    # Run with coverage
    pytest --cov=app --cov-report=html
    
    # Run with verbose output
    pytest -v
    
    # Run specific test
    pytest tests/test_auth.py::test_get_login_url

Test Database:
    Tests use a separate PostgreSQL database (agentic_trust_test) that is
    automatically created and torn down for each test. Ensure PostgreSQL
    is running and the test database can be created.

Requirements:
    - PostgreSQL running on localhost:5432
    - Test database credentials configured in conftest.py
    - Redis running (optional, for cache tests)
"""
