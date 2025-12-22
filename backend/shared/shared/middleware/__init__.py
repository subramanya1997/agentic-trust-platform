"""Shared middleware components for FastAPI services.

This package exports reusable FastAPI middleware components used across
all services. Middleware provides cross-cutting concerns like request
context, error handling, security headers, and rate limiting.

Exports:
    - RequestContextMiddleware: Binds request context for logging
    - ExceptionHandlerMiddleware: Global exception handling
    - SecurityHeadersMiddleware: Adds security headers to responses
    - create_limiter: Creates rate limiter with Redis backend

Usage:
    from shared.middleware import (
        RequestContextMiddleware,
        ExceptionHandlerMiddleware,
        SecurityHeadersMiddleware,
        create_limiter
    )
    
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(ExceptionHandlerMiddleware, debug=False)
"""

from shared.middleware.exception_handler import ExceptionHandlerMiddleware
from shared.middleware.rate_limit import create_limiter
from shared.middleware.request_context import RequestContextMiddleware
from shared.middleware.security_headers import SecurityHeadersMiddleware

__all__ = [
    "RequestContextMiddleware",
    "ExceptionHandlerMiddleware",
    "SecurityHeadersMiddleware",
    "create_limiter",
]

