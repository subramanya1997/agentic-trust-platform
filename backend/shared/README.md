# Shared Service

## Overview

The Shared Service provides common utilities, middleware, and libraries used across all microservices in the Agentic Trust Platform. It promotes code reuse, consistency, and standardization across services.

### Purpose

- **Cross-Service Authentication**: JWT utilities for service-to-service authentication
- **Structured Logging**: Centralized logging configuration with request correlation
- **Middleware Components**: Reusable FastAPI middleware for common concerns
- **Exception Handling**: Standardized error handling across services
- **Security Headers**: Security headers middleware for all services
- **Rate Limiting**: Redis-based rate limiting utilities

### Key Concepts

- **JWT Tokens**: Lightweight tokens for service-to-service authentication
- **Structured Logging**: JSON-formatted logs with context variables
- **Request Correlation**: Automatic request ID and trace ID propagation
- **OpenTelemetry Integration**: Distributed tracing support
- **Context Variables**: Thread-safe context for request-scoped data

## Architecture

### Package Structure

```
shared/
├── shared/
│   ├── auth/                    # JWT authentication utilities
│   │   ├── jwt.py               # JWT encoding/decoding
│   │   └── models.py            # ServiceUser model
│   ├── log_config/              # Logging configuration
│   │   ├── structured_logging.py # Modern structured logging
│   │   └── setup.py              # Legacy YAML-based logging
│   ├── middleware/              # FastAPI middleware
│   │   ├── exception_handler.py  # Global exception handler
│   │   ├── rate_limit.py        # Rate limiting utilities
│   │   ├── request_context.py   # Request context middleware
│   │   └── security_headers.py  # Security headers middleware
│   └── exceptions.py            # Base exception classes
├── tests/                        # Test suite
└── pyproject.toml               # Package configuration
```

### Design Decisions

1. **Shared Library Pattern**: Common code extracted to shared package to avoid duplication
2. **Structured Logging**: JSON logs in production for log aggregation systems
3. **Context Variables**: Thread-safe context for request-scoped data (async-safe)
4. **OpenTelemetry Integration**: Automatic trace ID extraction and correlation
5. **Middleware Composition**: Reusable middleware components for common concerns
6. **JWT for Service Auth**: Stateless tokens for service-to-service communication

## API Documentation

### Authentication (`shared.auth`)

#### `encode_jwt(user, expires_delta=None, additional_claims=None)`

Encode a JWT token for cross-service authentication.

**Parameters:**
- `user` (ServiceUser): User data to encode in token
- `expires_delta` (timedelta, optional): Token expiration time (default: 1 hour)
- `additional_claims` (dict, optional): Additional claims to include

**Returns:**
- `str`: Encoded JWT token

**Example:**
```python
from shared.auth.jwt import encode_jwt
from shared.auth.models import ServiceUser
from datetime import timedelta

user = ServiceUser(
    user_id="user_123",
    email="user@example.com",
    organization_id="org_456",
    role="admin"
)

token = encode_jwt(user, expires_delta=timedelta(hours=2))
```

**Error Handling:**
- Raises `ValueError` if `ENCRYPTION_KEY` environment variable is not set

#### `decode_jwt(token)`

Decode a JWT token.

**Parameters:**
- `token` (str): JWT token string

**Returns:**
- `dict`: Decoded JWT payload

**Raises:**
- `jwt.ExpiredSignatureError`: Token has expired
- `jwt.InvalidTokenError`: Token is invalid

**Example:**
```python
from shared.auth.jwt import decode_jwt

payload = decode_jwt(token)
print(payload["user_id"])
```

#### `validate_jwt(token)`

Validate a JWT token and return ServiceUser.

**Parameters:**
- `token` (str): JWT token string

**Returns:**
- `ServiceUser | None`: ServiceUser instance if valid, None otherwise

**Example:**
```python
from shared.auth.jwt import validate_jwt

user = validate_jwt(token)
if user:
    print(f"Authenticated: {user.email}")
```

#### `refresh_jwt(token, expires_delta=None)`

Refresh an existing JWT token.

**Parameters:**
- `token` (str): Existing JWT token
- `expires_delta` (timedelta, optional): New expiration time

**Returns:**
- `str | None`: New JWT token if valid, None otherwise

**Example:**
```python
from shared.auth.jwt import refresh_jwt
from datetime import timedelta

new_token = refresh_jwt(token, expires_delta=timedelta(hours=2))
```

### Structured Logging (`shared.log_config`)

#### `setup_structured_logging(service_name, environment, version, log_level, debug)`

Configure structured logging with structlog.

**Parameters:**
- `service_name` (str): Name of the service (e.g., "auth-service")
- `environment` (str): Environment ("development", "staging", "production")
- `version` (str): Service version (e.g., "0.1.0")
- `log_level` (str): Logging level ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL")
- `debug` (bool): If True, use colored console output; if False, use JSON

**Example:**
```python
from shared.log_config import setup_structured_logging

setup_structured_logging(
    service_name="auth-service",
    environment="production",
    version="0.1.0",
    log_level="INFO",
    debug=False,  # JSON output in production
)
```

**Behavior:**
- **Development (`debug=True`)**: Colored console output for readability
- **Production (`debug=False`)**: JSON output for log aggregation systems
- Automatically adds request context (request_id, org_id, user_id, trace_id)
- Suppresses noisy third-party loggers (uvicorn.access, httpx, httpcore)

#### `get_logger(name)`

Get a structured logger instance.

**Parameters:**
- `name` (str, optional): Logger name (usually `__name__` of the module)

**Returns:**
- `structlog.BoundLogger`: Configured logger instance

**Example:**
```python
from shared.log_config import get_logger

logger = get_logger(__name__)
logger.info("User logged in", user_id="123", action="login")
```

**Log Output (Production):**
```json
{
  "event": "User logged in",
  "user_id": "123",
  "action": "login",
  "request_id": "req_01ABC123",
  "org_id": "org_456",
  "trace_id": "abc123def456",
  "service": "auth-service",
  "environment": "production",
  "version": "0.1.0",
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "info"
}
```

#### `bind_request_context(request_id, org_id, user_id, trace_id)`

Bind context variables for the current request.

**Parameters:**
- `request_id` (str, optional): Unique request identifier
- `org_id` (str, optional): Organization ID from request
- `user_id` (str, optional): User ID from authenticated user
- `trace_id` (str, optional): OpenTelemetry trace ID

**Example:**
```python
from shared.log_config import bind_request_context

bind_request_context(
    request_id="req_01ABC123",
    org_id="org_456",
    user_id="user_789",
    trace_id="abc123def456"
)
```

#### `bind_user_context(user_id)`

Bind user ID to logging context after authentication.

**Parameters:**
- `user_id` (str): User ID from authenticated user

**Example:**
```python
from shared.log_config import bind_user_context

bind_user_context("user_789")
```

#### `clear_request_context()`

Clear context variables after request completes.

**Example:**
```python
from shared.log_config import clear_request_context

clear_request_context()
```

### Middleware (`shared.middleware`)

#### `RequestContextMiddleware`

Middleware to bind request context for structured logging.

**Features:**
- Generates or extracts request ID from headers
- Extracts organization ID from headers
- Captures OpenTelemetry trace ID (if available)
- Binds all context for the duration of the request
- Cleans up context after request completes
- Adds request ID to response headers
- Logs request completion with latency

**Usage:**
```python
from fastapi import FastAPI
from shared.middleware import RequestContextMiddleware

app = FastAPI()
app.add_middleware(RequestContextMiddleware)
```

**Response Headers:**
- `X-Request-ID`: Unique request identifier
- `X-Response-Time`: Request latency in milliseconds

**Example Log Output:**
```json
{
  "event": "Request completed",
  "method": "GET",
  "path": "/api/users",
  "status_code": 200,
  "latency_ms": 45.23,
  "client_ip": "192.168.1.1",
  "request_id": "req_01ABC123",
  "trace_id": "abc123def456"
}
```

#### `ExceptionHandlerMiddleware`

Global exception handler with structured error responses.

**Features:**
- Catches all exceptions at the middleware level
- Returns consistent JSON error responses
- Includes request_id in all error responses
- Logs errors with full context
- Hides sensitive details in production
- Tracks exception metrics (if metrics_counter provided)

**Usage:**
```python
from fastapi import FastAPI
from shared.middleware import ExceptionHandlerMiddleware
from prometheus_client import Counter

exceptions_total = Counter("exceptions_total", "Total exceptions", ["exception_type"])

app = FastAPI()
app.add_middleware(
    ExceptionHandlerMiddleware,
    debug=False,  # Set to True in development
    metrics_counter=lambda exception_type: exceptions_total.labels(
        exception_type=exception_type
    ).inc(),
)
```

**Error Response Format:**
```json
{
  "error": {
    "code": "ValidationError",
    "message": "Invalid email format",
    "request_id": "req_01ABC123",
    "timestamp": "2024-01-01T00:00:00Z",
    "details": {
      "field": "email",
      "value": "invalid"
    }
  }
}
```

**Exception Type Mapping:**
- `DatabaseError` → 500 Internal Server Error
- `WorkOSError` → 503 Service Unavailable
- `AuthenticationError` → 401 Unauthorized
- `AuthorizationError` → 403 Forbidden
- `ValidationError` → 400 Bad Request
- `NotFoundError` → 404 Not Found
- `ConflictError` → 409 Conflict
- `RateLimitError` → 429 Too Many Requests
- `ExternalServiceError` → 503 Service Unavailable
- `CircuitOpenError` → 503 Service Unavailable

#### `SecurityHeadersMiddleware`

Add security headers to all responses.

**Features:**
- `X-Content-Type-Options`: Prevent MIME type sniffing
- `X-Frame-Options`: Prevent clickjacking
- `X-XSS-Protection`: Enable XSS protection (legacy browsers)
- `Strict-Transport-Security`: Enforce HTTPS
- `Referrer-Policy`: Control referrer information
- `Permissions-Policy`: Restrict browser features
- Optional `Content-Security-Policy`

**Usage:**
```python
from fastapi import FastAPI
from shared.middleware import SecurityHeadersMiddleware

app = FastAPI()
app.add_middleware(
    SecurityHeadersMiddleware,
    content_security_policy="default-src 'self'"  # Optional CSP
)
```

**Headers Added:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'self'  # If provided
```

#### `create_limiter(redis_url, strategy, headers_enabled)`

Create and configure rate limiter with Redis backend.

**Parameters:**
- `redis_url` (str): Redis connection URL (e.g., "redis://localhost:6379")
- `strategy` (str): Rate limiting strategy ("fixed-window" or "moving-window")
- `headers_enabled` (bool): Whether to add rate limit headers to responses

**Returns:**
- `Limiter`: Configured Limiter instance

**Usage:**
```python
from fastapi import FastAPI
from shared.middleware import create_limiter
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

limiter = create_limiter(
    redis_url="redis://localhost:6379",
    strategy="fixed-window",
    headers_enabled=True,
)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Use in routes
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.get("/api/users")
@limiter.limit("10/minute")
async def get_users(request: Request):
    ...
```

**Rate Limit Headers:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: Time when limit resets

### Exception Classes (`shared.exceptions`)

#### `AgenticTrustError`

Base exception class for all platform errors.

**Attributes:**
- `message` (str): Human-readable error message
- `details` (dict | None): Optional error details

**Example:**
```python
from shared.exceptions import AgenticTrustError

class ValidationError(AgenticTrustError):
    """Raised when input validation fails."""
    pass

raise ValidationError(
    message="Invalid email format",
    details={"field": "email", "value": "invalid"}
)
```

## Implementation Details

### JWT Token Structure

JWT tokens contain the following claims:

```json
{
  "exp": 1234567890,
  "iat": 1234567890,
  "sub": "user_123",
  "user_id": "user_123",
  "email": "user@example.com",
  "organization_id": "org_456",
  "role": "admin",
  "permissions": ["*"]
}
```

**Token Lifecycle:**
1. Auth service creates token after user authentication
2. Token included in `Authorization: Bearer <token>` header
3. Services validate token using shared secret
4. Token expires after 1 hour (configurable)
5. Token can be refreshed using `refresh_jwt()`

### Structured Logging Architecture

**Processors Pipeline:**
1. `merge_contextvars`: Merge context variables into log
2. `add_log_level`: Add log level to event
3. `TimeStamper`: Add ISO timestamp
4. `StackInfoRenderer`: Add stack info for errors
5. `format_exc_info`: Format exception info
6. `add_request_context`: Add request context (request_id, org_id, user_id, trace_id)
7. `JSONRenderer` (production) or `ConsoleRenderer` (development)

**Context Variables:**
- `request_id_ctx`: Unique request identifier
- `org_id_ctx`: Organization ID from request
- `user_id_ctx`: User ID from authenticated user
- `trace_id_ctx`: OpenTelemetry trace ID

**Thread Safety:**
- Uses `contextvars` for async-safe context storage
- Each async task has its own context
- Context automatically cleared after request completes

### OpenTelemetry Integration

**Trace ID Extraction:**
```python
from opentelemetry import trace

span = trace.get_current_span()
span_context = span.get_span_context()
trace_id = format(span_context.trace_id, "032x")
```

**Trace Correlation:**
- Trace ID automatically extracted from OpenTelemetry span
- Added to all log entries as `trace_id` field
- Enables correlation between logs and traces

### Middleware Order

Recommended middleware order:

1. **SecurityHeadersMiddleware** (first): Ensure all responses have security headers
2. **PrometheusMiddleware**: Track metrics for all requests
3. **RequestContextMiddleware**: Bind request context for logging
4. **ExceptionHandlerMiddleware**: Catch and handle exceptions
5. **SlowAPIMiddleware**: Rate limiting
6. **CORSMiddleware**: CORS handling

## Examples

### Complete Service Setup

```python
from fastapi import FastAPI
from shared.log_config import setup_structured_logging, get_logger
from shared.middleware import (
    RequestContextMiddleware,
    ExceptionHandlerMiddleware,
    SecurityHeadersMiddleware,
    create_limiter,
)
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Setup logging
setup_structured_logging(
    service_name="my-service",
    environment="production",
    version="1.0.0",
    log_level="INFO",
    debug=False,
)

logger = get_logger(__name__)

# Create app
app = FastAPI()

# Add middleware (in order)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    ExceptionHandlerMiddleware,
    debug=False,
    metrics_counter=lambda exception_type: logger.warning(
        "Exception occurred", exception_type=exception_type
    ),
)

# Rate limiting
limiter = create_limiter(
    redis_url="redis://localhost:6379",
    strategy="fixed-window",
    headers_enabled=True,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Routes
@app.get("/health")
async def health():
    logger.info("Health check")
    return {"status": "healthy"}
```

### Using JWT for Service Authentication

```python
from fastapi import FastAPI, Depends, HTTPException, Header
from shared.auth.jwt import validate_jwt
from shared.auth.models import ServiceUser

app = FastAPI()

async def get_service_user(
    authorization: str = Header(..., description="Bearer token")
) -> ServiceUser:
    """Dependency to validate JWT and return ServiceUser."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    user = validate_jwt(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user

@app.get("/api/data")
async def get_data(user: ServiceUser = Depends(get_service_user)):
    # Use user context
    return {
        "user_id": user.user_id,
        "org_id": user.organization_id,
        "data": "..."
    }
```

### Structured Logging with Context

```python
from shared.log_config import get_logger, bind_request_context, bind_user_context

logger = get_logger(__name__)

# Bind context at request start
bind_request_context(
    request_id="req_01ABC123",
    org_id="org_456",
    trace_id="abc123def456"
)

# Bind user context after authentication
bind_user_context("user_789")

# Log with context automatically included
logger.info("User action", action="create_agent", agent_id="agent_123")

# Output (production):
# {
#   "event": "User action",
#   "action": "create_agent",
#   "agent_id": "agent_123",
#   "request_id": "req_01ABC123",
#   "org_id": "org_456",
#   "user_id": "user_789",
#   "trace_id": "abc123def456",
#   ...
# }
```

### Custom Exception Handling

```python
from shared.exceptions import AgenticTrustError
from fastapi import HTTPException

class CustomError(AgenticTrustError):
    """Custom error for this service."""
    pass

# In route handler
@app.post("/api/resource")
async def create_resource():
    try:
        # Business logic
        ...
    except ValueError as e:
        raise CustomError(
            message="Invalid input",
            details={"error": str(e)}
        )
    # ExceptionHandlerMiddleware will handle it
```

### Rate Limiting Example

```python
from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/api/users")
@limiter.limit("10/minute")
async def get_users(request: Request):
    return {"users": [...]}

@router.post("/api/users")
@limiter.limit("5/minute")
async def create_user(request: Request):
    return {"user": {...}}
```

## Best Practices

### Logging

1. **Use structured logging**: Always use `get_logger()` instead of standard logging
2. **Include context**: Log with relevant context (user_id, org_id, action)
3. **Log levels**: Use appropriate log levels (DEBUG, INFO, WARNING, ERROR)
4. **Don't log sensitive data**: Never log passwords, tokens, or PII
5. **Log errors with context**: Always include request_id and user context in error logs

### JWT Usage

1. **Validate tokens**: Always validate JWT tokens before trusting them
2. **Check expiration**: Tokens expire after 1 hour by default
3. **Use HTTPS**: Always use HTTPS when transmitting tokens
4. **Don't store in localStorage**: Use HTTP-only cookies or memory storage
5. **Refresh tokens**: Implement token refresh logic in clients

### Middleware

1. **Order matters**: Add middleware in the correct order
2. **Exception handling**: Always add ExceptionHandlerMiddleware
3. **Request context**: Add RequestContextMiddleware early for logging
4. **Security headers**: Add SecurityHeadersMiddleware first
5. **Rate limiting**: Use rate limiting for public endpoints

### Error Handling

1. **Use custom exceptions**: Extend `AgenticTrustError` for domain errors
2. **Include context**: Always include request_id in error responses
3. **Hide details in production**: Don't expose internal errors
4. **Log errors**: Always log errors with full context
5. **Return appropriate status codes**: Use correct HTTP status codes

## Common Pitfalls

1. **Missing context binding**: Forgetting to bind request context results in missing request_id in logs
2. **JWT secret mismatch**: Services must use the same `ENCRYPTION_KEY` to validate tokens
3. **Middleware order**: Wrong middleware order can cause issues (e.g., exception handler before context)
4. **Context leaks**: Not clearing context after request can cause context to leak to other requests
5. **Rate limiting without Redis**: Rate limiting requires Redis; service will fail if Redis is unavailable
6. **Logging sensitive data**: Accidentally logging passwords or tokens in error messages
7. **Missing OpenTelemetry**: Trace IDs won't be captured if OpenTelemetry isn't initialized

## Dependencies

### Key Libraries

- **structlog**: Structured logging
- **pyjwt**: JWT encoding/decoding
- **slowapi**: Rate limiting
- **fastapi**: Web framework (for middleware)
- **prometheus-client**: Metrics (optional)

### Optional Dependencies

- **opentelemetry-api**: Distributed tracing (optional, but recommended)

## Environment Variables

Required environment variables:

```bash
# JWT (required for auth module)
ENCRYPTION_KEY=your_32_char_encryption_key
JWT_ALGORITHM=HS256  # Optional, defaults to HS256

# Redis (required for rate limiting)
REDIS_URL=redis://localhost:6379
```

## Development

### Installation

This package is installed as an editable dependency by other services:

```bash
# From a service directory (e.g., auth-service)
uv sync
```

### Running Tests

```bash
cd backend/shared
uv run pytest
```

### Adding New Middleware

1. Create middleware class extending `BaseHTTPMiddleware`
2. Implement `async def dispatch(self, request, call_next)`
3. Add to `shared/middleware/__init__.py`
4. Document usage in this README

### Adding New Utilities

1. Create module in appropriate subpackage
2. Add to `__init__.py` for easy imports
3. Document API in this README
4. Add tests in `tests/`

## Troubleshooting

### JWT Validation Failing

1. Verify `ENCRYPTION_KEY` is the same across all services
2. Check token expiration: Tokens expire after 1 hour
3. Verify token format: Must be valid JWT format
4. Check algorithm: Must match `JWT_ALGORITHM` setting

### Logs Missing Context

1. Ensure `RequestContextMiddleware` is added to app
2. Verify context is bound: Check `bind_request_context()` is called
3. Check OpenTelemetry: Trace IDs require OpenTelemetry initialization
4. Verify logger setup: Must use `get_logger()` from shared package

### Rate Limiting Not Working

1. Verify Redis is running: `docker-compose ps redis`
2. Check `REDIS_URL` is correct
3. Verify limiter is added to app state
4. Check middleware order: SlowAPIMiddleware must be added

### Middleware Not Executing

1. Check middleware order: Some middleware must be added before others
2. Verify middleware is added to app: `app.add_middleware(...)`
3. Check for exceptions: Exceptions may prevent middleware execution
4. Review FastAPI docs: Some middleware behavior depends on FastAPI version

## License

[Your License Here]
