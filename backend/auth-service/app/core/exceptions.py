"""Custom exceptions for the authentication service.

NOTE: This module now re-exports exceptions from the shared package.
Import from here for backward compatibility within auth-service,
but prefer importing from 'shared.exceptions' in new code.
"""

# Re-export all exceptions from shared package
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

