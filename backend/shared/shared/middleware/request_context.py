"""Request context middleware for distributed tracing and structured logging."""

import time
from uuid import uuid4

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

try:
    from opentelemetry import trace as otel_trace
    OTEL_AVAILABLE = True
except ImportError:
    OTEL_AVAILABLE = False

from shared.log_config.structured_logging import (
    bind_request_context,
    clear_request_context,
    get_logger,
)

logger = get_logger(__name__)


class RequestContextMiddleware(BaseHTTPMiddleware):
    """
    Middleware to bind request context for structured logging.
    
    This middleware:
    - Generates or extracts request ID from headers
    - Extracts organization ID from headers
    - Captures OpenTelemetry trace ID (if available)
    - Binds all context for the duration of the request
    - Cleans up context after request completes
    - Adds request ID to response headers
    """

    async def dispatch(self, request: Request, call_next):
        """
        Process request and bind context for logging.
        
        Args:
            request: Incoming HTTP request
            call_next: Next middleware/handler in chain
            
        Returns:
            Response with X-Request-ID and X-Response-Time headers
        """
        # Generate or extract request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid4())
        
        # Start timing the request
        start_time = time.perf_counter()
        
        # Extract organization ID from headers (if present)
        org_id = request.headers.get("X-Organization-ID", "")
        
        # Get trace ID from OpenTelemetry (if available)
        trace_id = ""
        if OTEL_AVAILABLE:
            try:
                span = otel_trace.get_current_span()
                span_context = span.get_span_context()
                if span_context and span_context.trace_id:
                    trace_id = format(span_context.trace_id, "032x")
            except Exception:
                # If OpenTelemetry is not properly initialized, just skip
                pass
        
        # Bind context for all logs in this request
        bind_request_context(
            request_id=request_id,
            org_id=org_id,
            trace_id=trace_id,
        )
        
        # Store in request state for access in handlers
        request.state.request_id = request_id
        
        try:
            response = await call_next(request)
            
            # Calculate request latency
            latency_ms = (time.perf_counter() - start_time) * 1000
            
            # Log completed request with latency
            logger.info(
                "Request completed",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                latency_ms=round(latency_ms, 2),
                client_ip=request.client.host if request.client else None,
            )
            
            # Add headers to response
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{latency_ms:.2f}ms"
            
            return response
        except Exception as e:
            # Calculate latency even for failed requests
            latency_ms = (time.perf_counter() - start_time) * 1000
            
            # Log failed request
            logger.error(
                "Request failed",
                method=request.method,
                path=request.url.path,
                latency_ms=round(latency_ms, 2),
                error=str(e),
                error_type=type(e).__name__,
            )
            
            raise
        finally:
            # Always clean up context, even if request fails
            clear_request_context()

