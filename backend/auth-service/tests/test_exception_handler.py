"""Tests for global exception handler middleware."""

import json
from unittest.mock import patch

import pytest
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from shared.exceptions import (
    AgenticTrustError,
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    DatabaseError,
    NotFoundError,
    ValidationError,
    WorkOSError,
)
from shared.middleware import ExceptionHandlerMiddleware


class TestExceptionHandlerMiddleware:
    """Test suite for ExceptionHandlerMiddleware."""

    @pytest.fixture
    def middleware(self):
        """Create middleware instance."""
        return ExceptionHandlerMiddleware(app=None, debug=False)

    @pytest.fixture
    def mock_request(self):
        """Create mock request with request_id."""
        request = Request(
            scope={
                "type": "http",
                "method": "GET",
                "path": "/test",
                "query_string": b"",
                "headers": [],
            }
        )
        request.state.request_id = "test-request-id-123"
        return request

    @pytest.mark.asyncio
    async def test_successful_request_passthrough(self, middleware, mock_request):
        """Test that successful requests pass through unchanged."""

        async def call_next(request):
            return JSONResponse(content={"success": True}, status_code=200)

        response = await middleware.dispatch(mock_request, call_next)
        assert response.status_code == 200
        content = json.loads(response.body)
        assert content["success"] is True

    @pytest.mark.asyncio
    async def test_http_exception_passthrough(self, middleware, mock_request):
        """Test that HTTPExceptions are passed through to FastAPI."""

        async def call_next(request):
            raise HTTPException(status_code=404, detail="Not found")

        with pytest.raises(HTTPException) as exc_info:
            await middleware.dispatch(mock_request, call_next)
        
        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Not found"

    @pytest.mark.asyncio
    async def test_database_error_handling(self, middleware, mock_request):
        """Test DatabaseError returns 500 with structured response."""

        async def call_next(request):
            raise DatabaseError("Failed to connect to database")

        response = await middleware.dispatch(mock_request, call_next)
        assert response.status_code == 500
        
        content = json.loads(response.body)
        assert "error" in content
        assert content["error"]["code"] == "DatabaseError"
        assert content["error"]["message"] == "Failed to connect to database"
        assert content["error"]["request_id"] == "test-request-id-123"
        assert "timestamp" in content["error"]
        assert content["error"]["timestamp"].endswith("Z")

    @pytest.mark.asyncio
    async def test_workos_error_handling(self, middleware, mock_request):
        """Test WorkOSError returns 503 with structured response."""

        async def call_next(request):
            raise WorkOSError("WorkOS API unavailable")

        response = await middleware.dispatch(mock_request, call_next)
        assert response.status_code == 503
        
        content = json.loads(response.body)
        assert content["error"]["code"] == "WorkOSError"
        assert content["error"]["message"] == "WorkOS API unavailable"

    @pytest.mark.asyncio
    async def test_authentication_error_handling(self, middleware, mock_request):
        """Test AuthenticationError returns 401 with structured response."""

        async def call_next(request):
            raise AuthenticationError("Invalid credentials")

        response = await middleware.dispatch(mock_request, call_next)
        assert response.status_code == 401
        
        content = json.loads(response.body)
        assert content["error"]["code"] == "AuthenticationError"
        assert content["error"]["message"] == "Invalid credentials"

    @pytest.mark.asyncio
    async def test_authorization_error_handling(self, middleware, mock_request):
        """Test AuthorizationError returns 403 with structured response."""

        async def call_next(request):
            raise AuthorizationError("Insufficient permissions")

        response = await middleware.dispatch(mock_request, call_next)
        assert response.status_code == 403
        
        content = json.loads(response.body)
        assert content["error"]["code"] == "AuthorizationError"
        assert content["error"]["message"] == "Insufficient permissions"

    @pytest.mark.asyncio
    async def test_validation_error_handling(self, middleware, mock_request):
        """Test ValidationError returns 400 with structured response."""

        async def call_next(request):
            raise ValidationError("Invalid email format")

        response = await middleware.dispatch(mock_request, call_next)
        assert response.status_code == 400
        
        content = json.loads(response.body)
        assert content["error"]["code"] == "ValidationError"
        assert content["error"]["message"] == "Invalid email format"

    @pytest.mark.asyncio
    async def test_not_found_error_handling(self, middleware, mock_request):
        """Test NotFoundError returns 404 with structured response."""

        async def call_next(request):
            raise NotFoundError("Resource not found")

        response = await middleware.dispatch(mock_request, call_next)
        assert response.status_code == 404
        
        content = json.loads(response.body)
        assert content["error"]["code"] == "NotFoundError"
        assert content["error"]["message"] == "Resource not found"

    @pytest.mark.asyncio
    async def test_conflict_error_handling(self, middleware, mock_request):
        """Test ConflictError returns 409 with structured response."""

        async def call_next(request):
            raise ConflictError("Resource already exists")

        response = await middleware.dispatch(mock_request, call_next)
        assert response.status_code == 409
        
        content = json.loads(response.body)
        assert content["error"]["code"] == "ConflictError"
        assert content["error"]["message"] == "Resource already exists"

    @pytest.mark.asyncio
    async def test_error_with_details_in_debug_mode(self, middleware, mock_request):
        """Test that error details are included when debug=True."""

        async def call_next(request):
            raise DatabaseError(
                "Connection failed",
                details={"host": "localhost", "port": 5432},
            )

        with patch("app.middleware.exception_handler.settings") as mock_settings:
            mock_settings.debug = True
            response = await middleware.dispatch(mock_request, call_next)
        
        content = json.loads(response.body)
        assert "details" in content["error"]
        assert content["error"]["details"]["host"] == "localhost"
        assert content["error"]["details"]["port"] == 5432

    @pytest.mark.asyncio
    async def test_error_without_details_in_production(self, middleware, mock_request):
        """Test that error details are hidden when debug=False."""

        async def call_next(request):
            raise DatabaseError(
                "Connection failed",
                details={"host": "localhost", "port": 5432},
            )

        with patch("app.middleware.exception_handler.settings") as mock_settings:
            mock_settings.debug = False
            response = await middleware.dispatch(mock_request, call_next)
        
        content = json.loads(response.body)
        assert "details" not in content["error"]

    @pytest.mark.asyncio
    async def test_unhandled_exception_returns_500(self, middleware, mock_request):
        """Test that unhandled exceptions return safe 500 response."""

        async def call_next(request):
            raise ValueError("Unexpected error")

        response = await middleware.dispatch(mock_request, call_next)
        assert response.status_code == 500
        
        content = json.loads(response.body)
        assert content["error"]["code"] == "INTERNAL_ERROR"
        assert content["error"]["message"] == "An unexpected error occurred"
        assert "details" not in content["error"]  # Never expose internal errors
        assert content["error"]["request_id"] == "test-request-id-123"

    @pytest.mark.asyncio
    async def test_request_id_included_in_all_errors(self, middleware, mock_request):
        """Test that request_id is included in all error responses."""
        
        test_cases = [
            DatabaseError("DB error"),
            WorkOSError("WorkOS error"),
            AuthenticationError("Auth error"),
            ValueError("Unhandled error"),
        ]
        
        for exception in test_cases:
            async def call_next(request):
                raise exception
            
            response = await middleware.dispatch(mock_request, call_next)
            content = json.loads(response.body)
            
            assert content["error"]["request_id"] == "test-request-id-123"

    @pytest.mark.asyncio
    async def test_timestamp_format_is_iso8601(self, middleware, mock_request):
        """Test that timestamp is in ISO-8601 format with Z suffix."""

        async def call_next(request):
            raise DatabaseError("Test error")

        response = await middleware.dispatch(mock_request, call_next)
        content = json.loads(response.body)
        
        timestamp = content["error"]["timestamp"]
        assert timestamp.endswith("Z")
        # Verify it's a valid ISO-8601 format
        from datetime import datetime
        datetime.fromisoformat(timestamp.replace("Z", "+00:00"))

    @pytest.mark.asyncio
    async def test_exception_metrics_incremented(self, middleware, mock_request):
        """Test that exception metrics counter is incremented."""
        from app.core.metrics import exceptions_total
        
        # Get initial count
        initial_count = exceptions_total.labels(exception_type="DatabaseError")._value.get()
        
        async def call_next(request):
            raise DatabaseError("Test error")
        
        await middleware.dispatch(mock_request, call_next)
        
        # Verify count increased
        new_count = exceptions_total.labels(exception_type="DatabaseError")._value.get()
        assert new_count > initial_count

    @pytest.mark.asyncio
    async def test_request_without_request_id(self, middleware):
        """Test handling when request doesn't have request_id set."""
        request = Request(
            scope={
                "type": "http",
                "method": "GET",
                "path": "/test",
                "query_string": b"",
                "headers": [],
            }
        )
        # Don't set request.state.request_id

        async def call_next(request):
            raise DatabaseError("Test error")

        response = await middleware.dispatch(request, call_next)
        content = json.loads(response.body)
        
        # Should handle missing request_id gracefully
        assert content["error"]["request_id"] is None

