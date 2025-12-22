"""Structured logging with request correlation using structlog."""

import contextvars
import logging
import sys
from typing import Any

import structlog
from structlog.types import EventDict, WrappedLogger

# Context variables for request-scoped logging
request_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar(
    "request_id", default=""
)
org_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar("org_id", default="")
user_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar("user_id", default="")
trace_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar(
    "trace_id", default=""
)


def add_request_context(
    logger: WrappedLogger, method_name: str, event_dict: EventDict
) -> EventDict:
    """Add request context to every log entry.
    
    Args:
        logger: The wrapped logger instance
        method_name: The name of the method being called
        event_dict: The event dictionary to be logged
        
    Returns:
        Updated event dictionary with request context
    """
    request_id = request_id_ctx.get()
    org_id = org_id_ctx.get()
    user_id = user_id_ctx.get()
    trace_id = trace_id_ctx.get()
    
    if request_id:
        event_dict["request_id"] = request_id
    if org_id:
        event_dict["org_id"] = org_id
    if user_id:
        event_dict["user_id"] = user_id
    if trace_id:
        event_dict["trace_id"] = trace_id
    
    return event_dict


def add_service_context(
    logger: WrappedLogger, method_name: str, event_dict: EventDict
) -> EventDict:
    """Add service metadata to every log entry.
    
    Args:
        logger: The wrapped logger instance
        method_name: The name of the method being called
        event_dict: The event dictionary to be logged
        
    Returns:
        Updated event dictionary with service context
    """
    # These will be set during setup_structured_logging
    event_dict["service"] = event_dict.get("service", "unknown-service")
    event_dict["environment"] = event_dict.get("environment", "development")
    event_dict["version"] = event_dict.get("version", "0.1.0")
    return event_dict


def setup_structured_logging(
    service_name: str = "unknown-service",
    environment: str = "development",
    version: str = "0.1.0",
    log_level: str = "INFO",
    debug: bool = False,
) -> None:
    """Configure structured logging with structlog.
    
    Args:
        service_name: Name of the service for log context
        environment: Environment (development, staging, production)
        version: Service version for log context
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        debug: If True, use colored console output; if False, use JSON
    """
    # Shared processors for all configurations
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        add_request_context,
    ]
    
    # Store service context in a way that add_service_context can access
    # We'll use structlog's bind_contextvars for this
    structlog.contextvars.bind_contextvars(
        service=service_name,
        environment=environment,
        version=version,
    )
    
    if debug:
        # Development: colored console output
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True),
        ]
    else:
        # Production: JSON output
        processors = shared_processors + [
            structlog.processors.JSONRenderer(),
        ]
    
    # Get numeric log level
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(numeric_level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    # Configure standard library logging to use structlog
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=numeric_level,
    )
    
    # Suppress noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


def get_logger(name: str | None = None) -> structlog.BoundLogger:
    """Get a structured logger instance.
    
    Args:
        name: Logger name (usually __name__ of the module)
        
    Returns:
        Configured structlog BoundLogger instance
    """
    return structlog.get_logger(name)


def bind_request_context(
    request_id: str | None = None,
    org_id: str | None = None,
    user_id: str | None = None,
    trace_id: str | None = None,
) -> None:
    """Bind context variables for the current request.
    
    Args:
        request_id: Unique request identifier
        org_id: Organization ID from request
        user_id: User ID from authenticated user
        trace_id: OpenTelemetry trace ID
    """
    if request_id:
        request_id_ctx.set(request_id)
    if org_id:
        org_id_ctx.set(org_id)
    if user_id:
        user_id_ctx.set(user_id)
    if trace_id:
        trace_id_ctx.set(trace_id)


def clear_request_context() -> None:
    """Clear context variables after request completes."""
    request_id_ctx.set("")
    org_id_ctx.set("")
    user_id_ctx.set("")
    trace_id_ctx.set("")


def bind_user_context(user_id: str) -> None:
    """Bind user ID to logging context after authentication.
    
    Args:
        user_id: User ID from authenticated user
    """
    user_id_ctx.set(user_id)

