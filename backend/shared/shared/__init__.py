"""Shared libraries for all backend services.

This package provides shared utilities, middleware, and libraries used across
all microservices in the Agentic Trust Platform. It promotes code reuse and
consistency.

Main Modules:
    - auth: JWT utilities for cross-service authentication
    - log_config: Structured logging configuration
    - middleware: Reusable FastAPI middleware
    - exceptions: Custom exception classes

Key Exports:
    - Exception classes: DatabaseError, ValidationError, etc.
    - Logging: get_logger, setup_structured_logging
    - Middleware: RequestContextMiddleware, ExceptionHandlerMiddleware, etc.
    - Auth: encode_jwt, validate_jwt, ServiceUser

Usage:
    from shared import DatabaseError, get_logger
    from shared.middleware import RequestContextMiddleware
    from shared.auth import encode_jwt
"""

# Export commonly used exceptions at package level for convenience
from shared.exceptions import (
    AgenticTrustError,
    AuthenticationError,
    AuthorizationError,
    CircuitOpenError,
    ConflictError,
    DatabaseError,
    ExternalServiceError,
    NotFoundError,
    RateLimitError,
    ValidationError,
    WorkOSError,
)

__all__ = [
    "AgenticTrustError",
    "AuthenticationError",
    "AuthorizationError",
    "CircuitOpenError",
    "ConflictError",
    "DatabaseError",
    "ExternalServiceError",
    "NotFoundError",
    "RateLimitError",
    "ValidationError",
    "WorkOSError",
]

