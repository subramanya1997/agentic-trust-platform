"""Shared logging configuration for all services.

This package provides logging configuration for all services. It supports
both legacy YAML-based logging and modern structured logging with structlog.

Exports:
    Legacy (YAML-based):
    - setup_logging: Configure logging from YAML file
    - get_logger_legacy: Get logger for legacy logging
    
    Structured (structlog-based, recommended):
    - setup_structured_logging: Configure structured logging
    - get_logger: Get structured logger instance
    - bind_request_context: Bind request context variables
    - bind_user_context: Bind user ID to context
    - clear_request_context: Clear context after request

Usage:
    # Modern structured logging (recommended)
    from shared.log_config import setup_structured_logging, get_logger
    
    setup_structured_logging(
        service_name="my-service",
        environment="production",
        log_level="INFO",
        debug=False
    )
    
    logger = get_logger(__name__)
    logger.info("User logged in", user_id="123")
"""

from shared.log_config.setup import get_logger as get_logger_legacy
from shared.log_config.setup import setup_logging
from shared.log_config.structured_logging import (
    bind_request_context,
    bind_user_context,
    clear_request_context,
    get_logger,
    setup_structured_logging,
)

__all__ = [
    # Legacy logging (YAML-based)
    "setup_logging",
    "get_logger_legacy",
    # Structured logging (structlog-based)
    "setup_structured_logging",
    "get_logger",
    "bind_request_context",
    "bind_user_context",
    "clear_request_context",
]

