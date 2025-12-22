"""Tests for shared utilities package.

This package contains tests for shared utilities used across all services
in the Agentic Trust Platform. These tests verify the functionality of
common middleware, logging, and utility modules.

Test Modules:
    - test_request_context_middleware.py: Request context middleware tests
    - test_structured_logging.py: Structured logging system tests

Running Tests:
    # Run all shared tests
    pytest
    
    # Run specific test file
    pytest tests/test_structured_logging.py
    
    # Run with coverage
    pytest --cov=shared --cov-report=html

Test Coverage:
    - Request context management
    - Structured logging setup and usage
    - Context variable binding and clearing
    - JSON log output format
    - Development vs production logging modes
"""
