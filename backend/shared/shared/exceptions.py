"""Custom exceptions for Agentic Trust Platform services.

This module defines a hierarchy of custom exceptions used across all services
in the Agentic Trust Platform. These exceptions provide structured error
information and are automatically handled by the ExceptionHandlerMiddleware.

Exception Hierarchy:
    AgenticTrustError (base)
    ├── DatabaseError
    ├── WorkOSError
    ├── AuthenticationError
    ├── AuthorizationError
    ├── ValidationError
    ├── NotFoundError
    ├── ConflictError
    ├── RateLimitError
    ├── ExternalServiceError
    └── CircuitOpenError

Error Response Format:
    All exceptions are automatically converted to JSON responses:
    {
        "error": {
            "code": "ExceptionClassName",
            "message": "Human-readable message",
            "request_id": "req_01ABC123",
            "timestamp": "2024-01-01T00:00:00Z",
            "details": {...}  # Only in debug mode
        }
    }

Usage:
    from shared.exceptions import ValidationError, NotFoundError
    
    if not user:
        raise NotFoundError("User not found", {"user_id": user_id})
    
    if invalid_email:
        raise ValidationError("Invalid email format", {"email": email})
"""

from typing import Any


class AgenticTrustError(Exception):
    """
    Base exception for all Agentic Trust errors.
    
    All custom exceptions inherit from this class. It provides structured
    error information with a message and optional details dictionary.
    
    Attributes:
        message (str): Human-readable error message
        details (dict[str, Any]): Optional error details (only shown in debug mode)
    
    Example:
        raise AgenticTrustError(
            "Operation failed",
            {"field": "email", "value": "invalid"}
        )
    """

    def __init__(self, message: str, details: dict[str, Any] | None = None):
        """
        Initialize the exception with a message and optional details.
        
        Args:
            message: Human-readable error message
            details: Optional dictionary with error details (only shown in debug mode)
        """
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class DatabaseError(AgenticTrustError):
    """
    Raised when database operations fail.
    
    This exception is raised when database queries fail, connections are lost,
    or other database-related errors occur. It's automatically converted to
    a 500 Internal Server Error response.
    
    Example:
        raise DatabaseError(
            "Failed to save user",
            {"user_id": user_id, "original_error": str(e)}
        )
    """

    pass


class WorkOSError(AgenticTrustError):
    """
    Raised when WorkOS API operations fail.
    
    This exception is raised when WorkOS API calls fail or return errors.
    It's automatically converted to a 503 Service Unavailable response.
    
    Example:
        raise WorkOSError(
            "Failed to create organization",
            {"organization_name": name}
        )
    """

    pass


class AuthenticationError(AgenticTrustError):
    """
    Raised when authentication fails.
    
    This exception is raised when user authentication fails (invalid session,
    expired token, etc.). It's automatically converted to a 401 Unauthorized
    response.
    
    Example:
        raise AuthenticationError("Invalid session token")
    """

    pass


class AuthorizationError(AgenticTrustError):
    """
    Raised when authorization/permission checks fail.
    
    This exception is raised when a user doesn't have permission to perform
    an action. It's automatically converted to a 403 Forbidden response.
    
    Example:
        raise AuthorizationError(
            "User is not a member of this organization",
            {"user_id": user_id, "organization_id": org_id}
        )
    """

    pass


class ValidationError(AgenticTrustError):
    """
    Raised when input validation fails.
    
    This exception is raised when request data fails validation (invalid format,
    missing required fields, etc.). It's automatically converted to a 400 Bad
    Request response.
    
    Example:
        raise ValidationError(
            "Invalid email format",
            {"field": "email", "value": "invalid"}
        )
    """

    pass


class NotFoundError(AgenticTrustError):
    """
    Raised when a requested resource is not found.
    
    This exception is raised when a requested resource doesn't exist.
    It's automatically converted to a 404 Not Found response.
    
    Example:
        raise NotFoundError(
            "User not found",
            {"user_id": user_id}
        )
    """

    pass


class ConflictError(AgenticTrustError):
    """
    Raised when an operation conflicts with existing state.
    
    This exception is raised when an operation would create a conflict
    (e.g., duplicate email, concurrent modification). It's automatically
    converted to a 409 Conflict response.
    
    Example:
        raise ConflictError(
            "Email already exists",
            {"email": email}
        )
    """

    pass


class RateLimitError(AgenticTrustError):
    """
    Raised when rate limits are exceeded.
    
    This exception is raised when a user exceeds rate limits. It's automatically
    converted to a 429 Too Many Requests response.
    
    Example:
        raise RateLimitError(
            "Rate limit exceeded",
            {"limit": 10, "window": "1 minute"}
        )
    """

    pass


class ExternalServiceError(AgenticTrustError):
    """
    Raised when external service calls fail.
    
    This exception is raised when calls to external services fail (not WorkOS).
    It's automatically converted to a 503 Service Unavailable response.
    
    Example:
        raise ExternalServiceError(
            "Payment service unavailable",
            {"service": "stripe"}
        )
    """

    pass


class CircuitOpenError(AgenticTrustError):
    """
    Raised when circuit breaker is open and blocking requests.
    
    This exception is raised when a circuit breaker is open and requests
    are being blocked. It's automatically converted to a 503 Service
    Unavailable response.
    
    Example:
        raise CircuitOpenError(
            "WorkOS API circuit breaker is open",
            {"service": "workos", "retry_after": 30}
        )
    """

    pass

