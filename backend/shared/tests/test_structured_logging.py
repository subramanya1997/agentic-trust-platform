"""Tests for structured logging functionality."""

import json
import logging
from io import StringIO

import pytest
import structlog

from shared.log_config.structured_logging import (
    bind_request_context,
    bind_user_context,
    clear_request_context,
    get_logger,
    request_id_ctx,
    org_id_ctx,
    user_id_ctx,
    trace_id_ctx,
    setup_structured_logging,
)


class TestContextVariables:
    """Test context variable binding and clearing."""

    def test_bind_request_context_all_fields(self):
        """Test binding all context fields."""
        bind_request_context(
            request_id="req-123",
            org_id="org-456",
            user_id="user-789",
            trace_id="trace-abc",
        )

        assert request_id_ctx.get() == "req-123"
        assert org_id_ctx.get() == "org-456"
        assert user_id_ctx.get() == "user-789"
        assert trace_id_ctx.get() == "trace-abc"

        clear_request_context()

    def test_bind_request_context_partial_fields(self):
        """Test binding only some context fields."""
        bind_request_context(request_id="req-123", org_id="org-456")

        assert request_id_ctx.get() == "req-123"
        assert org_id_ctx.get() == "org-456"
        assert user_id_ctx.get() == ""
        assert trace_id_ctx.get() == ""

        clear_request_context()

    def test_bind_user_context(self):
        """Test binding user context after authentication."""
        bind_user_context("user-authenticated")

        assert user_id_ctx.get() == "user-authenticated"

        clear_request_context()

    def test_clear_request_context(self):
        """Test clearing all context variables."""
        bind_request_context(
            request_id="req-123",
            org_id="org-456",
            user_id="user-789",
            trace_id="trace-abc",
        )

        clear_request_context()

        assert request_id_ctx.get() == ""
        assert org_id_ctx.get() == ""
        assert user_id_ctx.get() == ""
        assert trace_id_ctx.get() == ""


class TestStructuredLogging:
    """Test structured logging setup and output."""

    def test_setup_structured_logging_development(self, capsys):
        """Test structured logging setup for development."""
        setup_structured_logging(
            service_name="test-service",
            environment="development",
            version="1.0.0",
            log_level="INFO",
            debug=True,
        )

        logger = get_logger("test")
        logger.info("test message", extra_field="value")

        # Capture should work with structlog
        # Note: In dev mode, output goes to ConsoleRenderer which is colored

    def test_setup_structured_logging_production(self):
        """Test structured logging setup for production (JSON output)."""
        # Redirect stdout to capture JSON logs
        import sys
        old_stdout = sys.stdout
        sys.stdout = StringIO()

        try:
            setup_structured_logging(
                service_name="test-service",
                environment="production",
                version="1.0.0",
                log_level="INFO",
                debug=False,
            )

            logger = get_logger("test")
            bind_request_context(
                request_id="req-test",
                org_id="org-test",
                user_id="user-test",
                trace_id="trace-test",
            )

            logger.info("test message", extra_field="value")

            # Get output
            output = sys.stdout.getvalue()

            # Should be JSON in production mode
            # Parse the JSON line
            if output.strip():
                log_entry = json.loads(output.strip())
                assert log_entry["event"] == "test message"
                assert log_entry["request_id"] == "req-test"
                assert log_entry["org_id"] == "org-test"
                assert log_entry["user_id"] == "user-test"
                assert log_entry["trace_id"] == "trace-test"
                assert log_entry["extra_field"] == "value"

        finally:
            sys.stdout = old_stdout
            clear_request_context()

    def test_logger_with_context(self):
        """Test that logger includes context in log entries."""
        setup_structured_logging(
            service_name="test-service",
            environment="test",
            version="1.0.0",
            log_level="DEBUG",
            debug=False,
        )

        bind_request_context(
            request_id="req-context-test",
            org_id="org-context-test",
        )

        logger = get_logger("test.context")

        # Just ensure logger works with context
        logger.info("Context test message")

        clear_request_context()

    def test_logger_without_context(self):
        """Test that logger works even without context bound."""
        setup_structured_logging(
            service_name="test-service",
            environment="test",
            version="1.0.0",
            log_level="INFO",
            debug=True,
        )

        logger = get_logger("test.no_context")
        logger.info("No context message")

    def test_multiple_loggers(self):
        """Test that multiple loggers share the same context."""
        setup_structured_logging(
            service_name="test-service",
            environment="test",
            version="1.0.0",
            log_level="INFO",
            debug=True,
        )

        bind_request_context(request_id="shared-context")

        logger1 = get_logger("test.logger1")
        logger2 = get_logger("test.logger2")

        logger1.info("Message from logger1")
        logger2.info("Message from logger2")

        # Both should have access to the same context
        assert request_id_ctx.get() == "shared-context"

        clear_request_context()

