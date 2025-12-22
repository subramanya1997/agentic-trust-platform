"""Middleware modules for the authentication service.

NOTE: Most middleware has been moved to the shared package.
This module now re-exports from shared for backward compatibility.
Prefer importing from 'shared.middleware' in new code.
"""

# Re-export from shared package
from shared.middleware import (
    ExceptionHandlerMiddleware,
    RequestContextMiddleware,
    create_limiter,
)

__all__ = [
    "ExceptionHandlerMiddleware",
    "RequestContextMiddleware",
    "create_limiter",
]

