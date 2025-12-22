"""Tests for request context middleware."""

from unittest.mock import AsyncMock, Mock, patch
from uuid import UUID

import pytest
from fastapi import FastAPI, Request
from starlette.testclient import TestClient

from shared.log_config.structured_logging import (
    clear_request_context,
    request_id_ctx,
    org_id_ctx,
    trace_id_ctx,
)
from shared.middleware import RequestContextMiddleware


@pytest.fixture
def app():
    """Create a test FastAPI app with middleware."""
    app = FastAPI()
    app.add_middleware(RequestContextMiddleware)

    @app.get("/test")
    async def test_endpoint(request: Request):
        """Test endpoint that returns context."""
        return {
            "request_id_from_state": request.state.request_id,
            "request_id_from_ctx": request_id_ctx.get(),
            "org_id_from_ctx": org_id_ctx.get(),
            "trace_id_from_ctx": trace_id_ctx.get(),
        }

    return app


@pytest.fixture
def client(app):
    """Create a test client."""
    return TestClient(app)


class TestRequestContextMiddleware:
    """Test RequestContextMiddleware functionality."""

    def test_generates_request_id(self, client):
        """Test that middleware generates a request ID if none provided."""
        response = client.get("/test")

        assert response.status_code == 200
        data = response.json()

        # Should have generated a request ID
        assert data["request_id_from_state"]
        assert data["request_id_from_ctx"]
        assert data["request_id_from_state"] == data["request_id_from_ctx"]

        # Should be a valid UUID
        UUID(data["request_id_from_state"])

        # Should be in response headers
        assert "X-Request-ID" in response.headers
        assert response.headers["X-Request-ID"] == data["request_id_from_state"]

    def test_uses_provided_request_id(self, client):
        """Test that middleware uses request ID from headers if provided."""
        custom_request_id = "custom-req-123"

        response = client.get("/test", headers={"X-Request-ID": custom_request_id})

        assert response.status_code == 200
        data = response.json()

        # Should use the provided request ID
        assert data["request_id_from_state"] == custom_request_id
        assert data["request_id_from_ctx"] == custom_request_id
        assert response.headers["X-Request-ID"] == custom_request_id

    def test_extracts_organization_id(self, client):
        """Test that middleware extracts organization ID from headers."""
        org_id = "org-test-456"

        response = client.get("/test", headers={"X-Organization-ID": org_id})

        assert response.status_code == 200
        data = response.json()

        # Should have extracted org ID
        assert data["org_id_from_ctx"] == org_id

    def test_clears_context_after_request(self, client):
        """Test that context is cleared after request completes."""
        # Make a request with context
        client.get("/test", headers={"X-Request-ID": "req-1", "X-Organization-ID": "org-1"})

        # After request, context should be cleared
        assert request_id_ctx.get() == ""
        assert org_id_ctx.get() == ""
        assert trace_id_ctx.get() == ""

    def test_clears_context_on_error(self, app):
        """Test that context is cleared even if request fails."""
        @app.get("/error")
        async def error_endpoint():
            """Endpoint that raises an error."""
            raise ValueError("Test error")

        client = TestClient(app)

        # Make request that will fail
        with pytest.raises(Exception):
            client.get("/error", headers={"X-Request-ID": "req-error"})

        # Context should still be cleared
        assert request_id_ctx.get() == ""
        assert org_id_ctx.get() == ""

    @patch("shared.middleware.request_context.OTEL_AVAILABLE", True)
    @patch("shared.middleware.request_context.otel_trace")
    def test_extracts_trace_id_from_opentelemetry(self, mock_otel_trace, client):
        """Test that middleware extracts trace ID from OpenTelemetry."""
        # Mock OpenTelemetry span
        mock_span = Mock()
        mock_span_context = Mock()
        mock_span_context.trace_id = 123456789012345678901234567890123456
        mock_span.get_span_context.return_value = mock_span_context
        mock_otel_trace.get_current_span.return_value = mock_span

        response = client.get("/test")

        assert response.status_code == 200
        data = response.json()

        # Should have extracted trace ID (formatted as 32-char hex)
        assert len(data["trace_id_from_ctx"]) == 32

    @patch("shared.middleware.request_context.OTEL_AVAILABLE", False)
    def test_works_without_opentelemetry(self, client):
        """Test that middleware works even if OpenTelemetry is not available."""
        response = client.get("/test")

        assert response.status_code == 200
        data = response.json()

        # Should work without trace ID
        assert data["request_id_from_state"]
        assert data["trace_id_from_ctx"] == ""

    def test_multiple_sequential_requests(self, client):
        """Test that context is properly isolated between requests."""
        # First request
        response1 = client.get("/test", headers={"X-Request-ID": "req-1", "X-Organization-ID": "org-1"})
        data1 = response1.json()

        # Second request
        response2 = client.get("/test", headers={"X-Request-ID": "req-2", "X-Organization-ID": "org-2"})
        data2 = response2.json()

        # Each request should have its own context
        assert data1["request_id_from_ctx"] == "req-1"
        assert data1["org_id_from_ctx"] == "org-1"

        assert data2["request_id_from_ctx"] == "req-2"
        assert data2["org_id_from_ctx"] == "org-2"

        # After both requests, context should be cleared
        assert request_id_ctx.get() == ""
        assert org_id_ctx.get() == ""

