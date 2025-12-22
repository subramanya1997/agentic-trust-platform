# Auth Service

## Overview

The Auth Service is the authentication and authorization microservice for the Agentic Trust Platform. It handles user authentication, organization management, team member management, and permission enforcement across all platform services.

### Purpose

- **User Authentication**: Secure OAuth-based authentication via WorkOS
- **Session Management**: HTTP-only cookie-based session handling with CSRF protection
- **Organization Management**: Multi-tenant organization/workspace management
- **Team Management**: Member invitations, role assignments, and access control
- **Permission System**: Role-based access control (RBAC) with fine-grained permissions
- **Audit Logging**: Comprehensive audit trail of all user actions
- **Cross-Service Auth**: JWT token generation for service-to-service authentication

### Key Concepts

- **WorkOS Integration**: Uses WorkOS for OAuth authentication and organization management
- **Session-Based Auth**: HTTP-only cookies store encrypted WorkOS sessions
- **Multi-Tenancy**: Users can belong to multiple organizations with different roles
- **Schema Separation**: All auth data stored in `auth` schema within shared database
- **Circuit Breaker**: Protects against WorkOS API failures with automatic recovery

## Architecture

### Service Structure

```
auth-service/
├── app/
│   ├── config/          # Application settings and configuration
│   ├── core/            # Core utilities (auth, permissions, exceptions, etc.)
│   ├── models/          # SQLModel database models
│   ├── repositories/    # Data access layer
│   ├── routers/         # FastAPI route handlers
│   ├── schemas/         # Pydantic request/response schemas
│   ├── services/        # Business logic layer
│   ├── database.py      # Database connection and session management
│   ├── dependencies.py  # FastAPI dependencies (auth, permissions)
│   └── main.py          # Application entry point
├── alembic/             # Database migrations
├── tests/               # Test suite
└── pyproject.toml       # Dependencies and project configuration
```

### Design Decisions

1. **WorkOS Integration**: Leverages WorkOS for OAuth, eliminating the need to manage OAuth providers directly
2. **Cookie-Based Sessions**: HTTP-only cookies provide better security than JWT tokens stored in localStorage
3. **CSRF Protection**: State-based CSRF tokens prevent cross-site request forgery attacks
4. **Circuit Breaker Pattern**: Prevents cascading failures when WorkOS API is unavailable
5. **Structured Logging**: JSON-formatted logs with request correlation for production observability
6. **OpenTelemetry Tracing**: Distributed tracing for request flow across services
7. **Rate Limiting**: Redis-based rate limiting protects against abuse
8. **Schema Separation**: Single database with schema separation simplifies multi-service deployments

### Database Schema

All tables are stored in the `auth` schema:

- `auth.users` - User accounts synced from WorkOS
- `auth.organizations` - Organizations/workspaces
- `auth.audit_events` - Audit log of all user actions
- WorkOS manages memberships and roles externally

## API Documentation

### Authentication Endpoints

#### `GET /auth/login-url`

Get WorkOS authorization URL for OAuth login.

**Query Parameters:**
- `redirect_uri` (optional): Where to redirect after authentication
- `provider` (optional): OAuth provider - `"GoogleOAuth"`, `"GitHubOAuth"`, or `"authkit"` (default)

**Rate Limit:** 10 requests/minute per IP

**Response:**
```json
{
  "authorization_url": "https://api.workos.com/authorize?..."
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/auth/login-url?provider=GoogleOAuth"
```

**Security:**
- Generates cryptographic CSRF state token
- Stores hashed state in secure HTTP-only cookie
- Validates state on callback to prevent CSRF attacks

#### `GET /auth/callback`

Handle OAuth callback from WorkOS.

**Query Parameters:**
- `code` (required): Authorization code from WorkOS
- `state` (required): CSRF state token

**Rate Limit:** 20 requests/minute per IP

**Response:**
```json
{
  "success": true,
  "user_id": "user_01ABC123"
}
```

**Security:**
- Validates CSRF state token matches cookie hash
- Sets HTTP-only session cookie
- Creates user in database if first login
- Ensures user has at least one organization

**Error Handling:**
- `403 Forbidden`: Invalid CSRF state
- `503 Service Unavailable`: WorkOS API unavailable (circuit breaker open)
- `500 Internal Server Error`: Database error

#### `POST /auth/logout`

Log out user by clearing session cookie.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### `POST /auth/refresh`

Refresh session cookie to extend session without re-authentication.

**Rate Limit:** 10 requests/minute per IP

**Response:**
```json
{
  "success": true,
  "message": "Session refreshed successfully"
}
```

**Error Handling:**
- `401 Unauthorized`: No session cookie or session expired
- `503 Service Unavailable`: WorkOS API unavailable

#### `GET /auth/me`

Get current authenticated user information.

**Authentication:** Required (session cookie)

**Response:**
```json
{
  "id": "user_01ABC123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "email_verified": true,
  "profile_picture_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "last_login_at": "2024-01-01T00:00:00Z",
  "last_login_ip": "192.168.1.1"
}
```

#### `GET /auth/organizations`

Get all organizations the current user is a member of.

**Authentication:** Required (session cookie)

**Response:**
```json
[
  {
    "id": "org_01ABC123",
    "organization_id": "org_01ABC123",
    "organization_name": "Acme Corp",
    "role": "admin"
  }
]
```

#### `GET /auth/session`

Get current session information.

**Authentication:** Required (session cookie)

**Response:**
```json
{
  "user_id": "user_01ABC123",
  "email": "user@example.com",
  "organization_id": "org_01ABC123",
  "role": "admin"
}
```

### Organization Endpoints

#### `GET /organizations`

List all organizations the current user is a member of.

**Authentication:** Required (session cookie)

**Response:**
```json
[
  {
    "id": "org_01ABC123",
    "name": "Acme Corp",
    "logo_url": "https://...",
    "billing_email": "billing@acme.com",
    "settings": {},
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### `POST /organizations`

Create a new organization.

**Authentication:** Required (session cookie)

**Request Body:**
```json
{
  "name": "New Organization"
}
```

**Response:**
```json
{
  "id": "org_01ABC123",
  "name": "New Organization",
  "logo_url": null,
  "billing_email": null,
  "settings": {},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Handling:**
- `400 Bad Request`: Invalid organization name
- `503 Service Unavailable`: WorkOS API error

#### `GET /organizations/current`

Get the currently selected organization (from `X-Organization-ID` header).

**Authentication:** Required (session cookie)
**Headers:** `X-Organization-ID: org_01ABC123`

**Response:**
```json
{
  "id": "org_01ABC123",
  "name": "Acme Corp",
  "logo_url": "https://...",
  "billing_email": "billing@acme.com",
  "settings": {},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### `PATCH /organizations/current`

Update the current organization's settings.

**Authentication:** Required (session cookie)
**Headers:** `X-Organization-ID: org_01ABC123`

**Request Body:**
```json
{
  "name": "Updated Name",
  "logo_url": "https://...",
  "billing_email": "new@acme.com",
  "settings": {
    "theme": "dark"
  }
}
```

**Response:**
```json
{
  "id": "org_01ABC123",
  "name": "Updated Name",
  "logo_url": "https://...",
  "billing_email": "new@acme.com",
  "settings": {
    "theme": "dark"
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T01:00:00Z"
}
```

#### `GET /organizations/{org_id}`

Get a specific organization by ID.

**Authentication:** Required (session cookie)
**Authorization:** User must be a member of the organization

**Response:**
```json
{
  "id": "org_01ABC123",
  "name": "Acme Corp",
  "logo_url": "https://...",
  "billing_email": "billing@acme.com",
  "settings": {},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Handling:**
- `403 Forbidden`: User is not a member of the organization
- `404 Not Found`: Organization not found

### Team Management Endpoints

#### `GET /team/members`

List all team members in the current organization.

**Authentication:** Required (session cookie)
**Authorization:** Requires `admin`, `member`, or `viewer` role
**Headers:** `X-Organization-ID: org_01ABC123`

**Response:**
```json
[
  {
    "id": "user_01ABC123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "invited_at": "2024-01-01T00:00:00Z"
  }
]
```

#### `POST /team/invite`

Invite a new member to the organization.

**Authentication:** Required (session cookie)
**Authorization:** Requires `admin` or `member` role
**Headers:** `X-Organization-ID: org_01ABC123`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "member"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent to newuser@example.com"
}
```

**Error Handling:**
- `400 Bad Request`: Invalid email or role
- `403 Forbidden`: Insufficient permissions
- `409 Conflict`: User already a member

### Permissions Endpoints

#### `GET /permissions/roles`

List all available roles and their permissions.

**Authentication:** Required (session cookie)

**Response:**
```json
[
  {
    "slug": "admin",
    "name": "Administrator",
    "description": "Full access to all features",
    "permissions": ["*"]
  },
  {
    "slug": "member",
    "name": "Member",
    "description": "Can create and manage agents",
    "permissions": ["agents:create", "agents:read", "agents:update"]
  }
]
```

### Audit Log Endpoints

#### `GET /audit/events`

List audit events for the current organization.

**Authentication:** Required (session cookie)
**Headers:** `X-Organization-ID: org_01ABC123`

**Query Parameters:**
- `limit` (optional): Number of results (1-100, default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": "event_01ABC123",
    "user_id": "user_01ABC123",
    "user_email": "user@example.com",
    "action": "user.login",
    "resource_type": "user",
    "resource_id": "user_01ABC123",
    "metadata": {
      "ip_address": "192.168.1.1"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### `POST /audit/sync`

Manually sync audit events from WorkOS (admin only).

**Authentication:** Required (session cookie)
**Authorization:** Requires `admin` role
**Headers:** `X-Organization-ID: org_01ABC123`

**Response:**
```json
{
  "success": true,
  "events_synced": 42
}
```

### Health Check Endpoints

#### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "auth-service",
  "version": "0.1.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### `GET /health/ready`

Readiness check (includes database connectivity).

**Response:**
```json
{
  "status": "ready",
  "service": "auth-service",
  "version": "0.1.0",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Implementation Details

### Authentication Flow

1. **Login Initiation:**
   - Client calls `GET /auth/login-url`
   - Server generates CSRF state token
   - Stores hashed state in secure cookie
   - Returns WorkOS authorization URL with state parameter

2. **OAuth Callback:**
   - User authenticates with WorkOS
   - WorkOS redirects to `/auth/callback` with code and state
   - Server validates CSRF state matches cookie hash
   - Exchanges code for WorkOS session
   - Syncs user and organization data to database
   - Sets HTTP-only session cookie
   - Redirects to frontend

3. **Authenticated Requests:**
   - Client includes session cookie in requests
   - Server validates session with WorkOS
   - Extracts user and organization context
   - Enforces permissions based on role

### Session Management

- **Session Storage:** HTTP-only cookies prevent XSS attacks
- **Session Format:** WorkOS sealed session tokens (encrypted)
- **Session Duration:** 7 days (configurable)
- **Session Refresh:** Automatic refresh via `/auth/refresh` endpoint
- **Security:** Secure flag in production, SameSite=Lax for CSRF protection

### Permission System

The service uses WorkOS roles with a permission mapping:

- **admin**: Full access (`*` permission)
- **member**: Can create/manage resources
- **viewer**: Read-only access

Permissions are enforced via FastAPI dependencies:

```python
from app.core.permissions import require_role

@router.post("/agents", dependencies=[Depends(require_role(["admin", "member"]))])
async def create_agent(...):
    ...
```

### Circuit Breaker

Protects against WorkOS API failures:

- **Failure Threshold:** 5 consecutive failures
- **Recovery Timeout:** 30 seconds
- **Half-Open State:** Allows one test request after timeout
- **Error Response:** Returns 503 with `Retry-After` header

### Rate Limiting

Redis-based rate limiting using SlowAPI:

- **Strategy:** Fixed-window
- **Storage:** Redis
- **Key:** Client IP address
- **Headers:** Rate limit info in response headers

### Error Handling

Structured error responses:

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

Custom exception types:
- `DatabaseError`: Database operation failures
- `WorkOSError`: WorkOS API failures
- `AuthenticationError`: Authentication failures
- `AuthorizationError`: Permission denied
- `ValidationError`: Invalid input data
- `NotFoundError`: Resource not found
- `ConflictError`: Resource conflict

### Database Connection Pooling

- **Pool Size:** CPU count × 2 (default)
- **Max Overflow:** CPU count × 4 (default)
- **Pool Timeout:** 30 seconds
- **Pool Recycle:** 1 hour

### Observability

**Structured Logging:**
- JSON format in production
- Colored console in development
- Request correlation via `request_id`
- Context variables: `user_id`, `org_id`, `trace_id`

**Metrics:**
- Prometheus metrics at `/metrics`
- Request latency tracking
- Exception counting
- Database connection pool metrics

**Distributed Tracing:**
- OpenTelemetry integration
- Trace correlation across services
- SQL query tracing

## Examples

### Complete Authentication Flow

```python
import httpx

# 1. Get login URL
response = httpx.get("http://localhost:8000/auth/login-url?provider=GoogleOAuth")
data = response.json()
authorization_url = data["authorization_url"]

# 2. User redirects to authorization_url and authenticates
# 3. WorkOS redirects to callback with code and state
# 4. Callback processes authentication and sets cookie

# 5. Make authenticated request
client = httpx.Client(cookies={"wos-session": "..."})
response = client.get(
    "http://localhost:8000/auth/me",
    headers={"X-Organization-ID": "org_01ABC123"}
)
user = response.json()
```

### Creating an Organization

```python
import httpx

client = httpx.Client(cookies={"wos-session": "..."})

response = client.post(
    "http://localhost:8000/organizations",
    json={"name": "My New Organization"},
    headers={"X-Organization-ID": "org_01ABC123"}
)

org = response.json()
print(f"Created organization: {org['name']}")
```

### Inviting Team Members

```python
import httpx

client = httpx.Client(cookies={"wos-session": "..."})

response = client.post(
    "http://localhost:8000/team/invite",
    json={
        "email": "newmember@example.com",
        "role": "member"
    },
    headers={"X-Organization-ID": "org_01ABC123"}
)

result = response.json()
print(result["message"])
```

### Using Permission Dependencies

```python
from fastapi import APIRouter, Depends
from app.core.permissions import require_role
from app.dependencies import get_current_user, get_current_org
from app.models import User, Organization

router = APIRouter()

@router.post("/agents")
async def create_agent(
    user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    _: str = Depends(require_role(["admin", "member"]))
):
    # Only admins and members can create agents
    ...
```

## Best Practices

### Security

1. **Never expose session cookies** in client-side JavaScript
2. **Always validate CSRF tokens** for state-changing operations
3. **Use HTTPS in production** to protect session cookies
4. **Set secure cookie flags** in production (`secure=True`)
5. **Validate organization membership** before accessing resources
6. **Use rate limiting** to prevent abuse
7. **Log security events** for audit purposes

### Error Handling

1. **Use custom exceptions** for domain-specific errors
2. **Don't expose internal errors** in production
3. **Include request_id** in all error responses
4. **Log errors with context** (user_id, org_id, request_id)
5. **Return appropriate HTTP status codes**

### Performance

1. **Use connection pooling** for database connections
2. **Batch database queries** to avoid N+1 problems
3. **Cache organization data** when appropriate
4. **Use circuit breaker** to fail fast on external API errors
5. **Monitor request latency** via Prometheus metrics

### Testing

1. **Mock WorkOS API** in unit tests
2. **Use test database** for integration tests
3. **Test CSRF protection** in security tests
4. **Test rate limiting** behavior
5. **Test permission enforcement** for all endpoints

## Common Pitfalls

1. **Missing X-Organization-ID header**: Many endpoints require this header. Always include it for authenticated requests.

2. **Session expiration**: Sessions expire after 7 days. Implement automatic refresh logic in the frontend.

3. **CSRF state validation**: Always validate CSRF state tokens. Missing validation can lead to CSRF attacks.

4. **WorkOS API failures**: Use circuit breaker pattern. Don't retry indefinitely on failures.

5. **Database connection leaks**: Always use async context managers for database sessions. Don't forget to close connections.

6. **Permission checks**: Always verify organization membership before accessing resources. Don't rely solely on role checks.

7. **Rate limiting**: Be aware of rate limits. Implement exponential backoff for retries.

## Dependencies

### External Services

- **WorkOS**: OAuth provider and organization management
- **PostgreSQL**: Database for user and organization data
- **Redis**: Rate limiting and caching

### Key Libraries

- **FastAPI**: Web framework
- **SQLModel**: ORM and database models
- **WorkOS SDK**: WorkOS API client
- **SlowAPI**: Rate limiting
- **CircuitBreaker**: Circuit breaker pattern
- **structlog**: Structured logging
- **OpenTelemetry**: Distributed tracing
- **Prometheus**: Metrics collection

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379

# WorkOS
WORKOS_API_KEY=your_api_key
WORKOS_CLIENT_ID=your_client_id
WORKOS_COOKIE_PASSWORD=your_32_char_cookie_password
WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback

# Encryption (also used for JWT)
ENCRYPTION_KEY=your_32_char_encryption_key

# Application
SERVICE_NAME=auth-service
SERVICE_ENV=development
LOG_LEVEL=INFO
DEBUG=true
```

## Development

### Running Locally

```bash
# Install dependencies
uv sync

# Run migrations
uv run alembic upgrade head

# Start server
uv run uvicorn app.main:app --reload --port 8000
```

### Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app --cov-report=html

# Run specific test file
uv run pytest tests/test_auth.py
```

### Creating Migrations

```bash
# Create new migration
uv run alembic revision --autogenerate -m "add user table"

# Apply migrations
uv run alembic upgrade head

# Rollback migration
uv run alembic downgrade -1
```

## Troubleshooting

### Session Not Working

1. Check cookie is being set: Inspect browser cookies
2. Verify cookie flags: `HttpOnly`, `Secure` (production), `SameSite`
3. Check session expiration: Sessions expire after 7 days
4. Verify WorkOS API: Check WorkOS dashboard for errors

### Database Connection Errors

1. Verify `DATABASE_URL` is correct
2. Check PostgreSQL is running: `docker-compose ps postgres`
3. Check connection pool settings
4. Review database logs for connection errors

### WorkOS API Errors

1. Check `WORKOS_API_KEY` is valid
2. Verify `WORKOS_CLIENT_ID` matches WorkOS dashboard
3. Check circuit breaker status: May be open due to failures
4. Review WorkOS API logs in dashboard

### Rate Limiting Issues

1. Verify Redis is running: `docker-compose ps redis`
2. Check `REDIS_URL` is correct
3. Review rate limit headers in responses
4. Adjust rate limits if needed

## License

[Your License Here]
