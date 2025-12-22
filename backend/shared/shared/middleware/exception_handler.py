"""Global exception handler middleware for consistent error responses."""

from datetime import UTC, datetime
from typing import Callable

from fastapi import Request
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from shared.log_config import get_logger
from starlette.middleware.base import BaseHTTPMiddleware

from shared.exceptions import AgenticTrustError

logger = get_logger(__name__)


class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    """
    Global exception handler with structured error responses.
    
    This middleware:
    - Catches all exceptions at the middleware level
    - Returns consistent JSON error responses
    - Includes request_id in all error responses
    - Logs errors with full context
    - Hides sensitive details in production
    - Tracks exception metrics (if metrics_counter provided)
    """

    # Map custom exception types to HTTP status codes
    ERROR_STATUS_MAP = {
        "DatabaseError": 500,
        "WorkOSError": 503,
        "AuthenticationError": 401,
        "AuthorizationError": 403,
        "ValidationError": 400,
        "NotFoundError": 404,
        "ConflictError": 409,
        "RateLimitError": 429,
        "ExternalServiceError": 503,
        "CircuitOpenError": 503,
    }

    def __init__(
        self,
        app,
        debug: bool = False,
        metrics_counter: Callable[[str], None] | None = None,
    ):
        """
        Initialize exception handler middleware.
        
        Args:
            app: ASGI application
            debug: Whether to include debug details in responses
            metrics_counter: Optional callback to track exception metrics.
                           Should accept exception_type as parameter.
        """
        super().__init__(app)
        self.debug = debug
        self.metrics_counter = metrics_counter

    async def dispatch(self, request: Request, call_next):
        """
        Process request and handle exceptions.
        
        Args:
            request: Incoming HTTP request
            call_next: Next middleware/handler in chain
            
        Returns:
            Response or error response
        """
        try:
            return await call_next(request)
        except HTTPException:
            # Let FastAPI handle HTTP exceptions (they already have proper format)
            raise
        except AgenticTrustError as e:
            # Handle our custom exceptions with structured responses
            exception_type = e.__class__.__name__
            status_code = self.ERROR_STATUS_MAP.get(exception_type, 500)
            
            # Log the error with context
            logger.error(
                f"{exception_type}: {e.message}",
                path=request.url.path,
                method=request.method,
                error_type=exception_type,
                error_details=e.details if self.debug else None,
                exc_info=self.debug,  # Include stack trace only in debug mode
            )
            
            # Track exception metrics if counter provided
            if self.metrics_counter:
                self.metrics_counter(exception_type)
            
            return self._create_error_response(
                request=request,
                status_code=status_code,
                error_code=exception_type,
                message=e.message,
                details=e.details if self.debug else None,
            )
        except Exception as e:
            # Handle unexpected exceptions
            exception_type = type(e).__name__
            
            logger.exception(
                "Unhandled exception",
                path=request.url.path,
                method=request.method,
                error_type=exception_type,
            )
            
            # Track exception metrics if counter provided
            if self.metrics_counter:
                self.metrics_counter(exception_type)
            
            return self._create_error_response(
                request=request,
                status_code=500,
                error_code="INTERNAL_ERROR",
                message="An unexpected error occurred",
                details=str(e) if self.debug else None,
            )

    def _create_error_response(
        self,
        request: Request,
        status_code: int,
        error_code: str,
        message: str,
        details: dict | str | None = None,
    ) -> JSONResponse:
        """
        Create a structured error response.
        
        Args:
            request: HTTP request
            status_code: HTTP status code
            error_code: Error code (exception class name)
            message: Human-readable error message
            details: Optional error details (only in debug mode)
            
        Returns:
            JSONResponse with structured error format
        """
        error_content = {
            "error": {
                "code": error_code,
                "message": message,
                "request_id": getattr(request.state, "request_id", None),
                "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            }
        }
        
        # Only include details if provided (debug mode)
        if details:
            error_content["error"]["details"] = details
        
        return JSONResponse(
            status_code=status_code,
            content=error_content,
        )

