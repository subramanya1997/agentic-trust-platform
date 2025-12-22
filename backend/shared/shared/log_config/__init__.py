"""Shared logging configuration for all services."""

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

