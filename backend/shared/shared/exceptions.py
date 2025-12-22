"""Custom exceptions for Agentic Trust Platform services."""

from typing import Any


class AgenticTrustError(Exception):
    """Base exception for all Agentic Trust errors."""

    def __init__(self, message: str, details: dict[str, Any] | None = None):
        """Initialize the exception with a message and optional details."""
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class DatabaseError(AgenticTrustError):
    """Raised when database operations fail."""

    pass


class WorkOSError(AgenticTrustError):
    """Raised when WorkOS API operations fail."""

    pass


class AuthenticationError(AgenticTrustError):
    """Raised when authentication fails."""

    pass


class AuthorizationError(AgenticTrustError):
    """Raised when authorization/permission checks fail."""

    pass


class ValidationError(AgenticTrustError):
    """Raised when input validation fails."""

    pass


class NotFoundError(AgenticTrustError):
    """Raised when a requested resource is not found."""

    pass


class ConflictError(AgenticTrustError):
    """Raised when an operation conflicts with existing state."""

    pass


class RateLimitError(AgenticTrustError):
    """Raised when rate limits are exceeded."""

    pass


class ExternalServiceError(AgenticTrustError):
    """Raised when external service calls fail."""

    pass


class CircuitOpenError(AgenticTrustError):
    """Raised when circuit breaker is open and blocking requests."""

    pass

