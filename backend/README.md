# Agentic Trust Platform - Backend Microservices

This directory contains the backend microservices for the Agentic Trust Platform.

## Architecture Overview

The backend is structured as a microservices architecture with:
- **Centralized configurations** in `configs/`
- **Shared libraries** in `shared/`
- **Individual services** at the root level

```
backend/
├── configs/                    # Centralized configuration files
│   └── logging/               # Logging configurations
│       ├── base.yaml          # Shared base config
│       └── auth-service.yaml  # Service-specific overrides
├── shared/                     # Shared libraries for all services
│   ├── logging/               # Shared logging setup
│   └── auth/                  # JWT utilities for cross-service auth
├── auth-service/              # Authentication & user management service
├── docker-compose.yml         # Backend services (postgres, redis, auth-service)
└── logs/                      # Shared logs directory
```

## Services

### Auth Service (auth-service/)

**Purpose:** Authentication, user management, and organization management

**Database:** `auth_db`

**Responsibilities:**
- User authentication via WorkOS
- User and organization CRUD operations
- Team member management
- Permission management
- Session management

**API:** `http://localhost:8000`

**Key Tables:**
- `users` - User accounts
- `organizations` - Organizations/workspaces
- `memberships` - User-organization relationships
- `permissions` - Role-based permissions

### Future Services

**Agent Service** (planned)
- Agent creation and management
- Agent execution and orchestration
- Agent version control
- Database: `agents_db`

**MCP Gateway** (planned)
- MCP server registry
- Tool registry and management
- API key management
- Database: `mcp_gateway_db`

## Database Architecture (Schema Separation)

### Design Principles

1. **Single database with schema separation**
   - All services share one database: `agentic_trust`
   - Each service has its own schema (e.g., `auth`, `agents`, `mcp`)
   - Simpler to manage than multiple databases

2. **Auth schema owns identity data**
   - All user and organization data lives in `auth.*` tables
   - Other services NEVER write to `auth` schema
   - Auth service provides APIs for user/org data

3. **Service schemas store references only**
   - Other services use their own schemas
   - Store only `user_id` and `org_id` as foreign references
   - Never duplicate user/org data

4. **Cross-service communication via JWT**
   - JWT tokens contain: `user_id`, `org_id`, `role`, `permissions`
   - Services validate JWT using shared secret
   - For detailed user info: call auth-service API

### Database Schema

```
Database: agentic_trust
├── auth schema (owned by auth-service)
│   ├── auth.users
│   ├── auth.organizations
│   ├── auth.memberships
│   └── auth.permissions
├── agents schema (future - owned by agent-service)
│   ├── agents.configs (references auth.users.id)
│   ├── agents.executions
│   └── agents.versions
└── mcp schema (future - owned by mcp-gateway)
    ├── mcp.servers (references auth.users.id)
    ├── mcp.tool_registry
    └── mcp.api_keys
```

## Shared Libraries

### Logging (`shared/logging/`)

YAML-based logging configuration with service identification.

**Usage:**
```python
from shared.logging import setup_logging, get_logger

# Initialize logging (in main.py)
setup_logging("configs/logging/auth-service.yaml")

# Get logger for module
logger = get_logger(__name__)
logger.info("Hello from auth service")
```

**Configuration:**
- Base config: `configs/logging/base.yaml`
- Service overrides: `configs/logging/{service-name}.yaml`
- Environment overrides: `LOG_LEVEL`, `LOG_FILE`, `SERVICE_NAME`

### Authentication (`shared/auth/`)

JWT utilities for cross-service authentication.

**Usage:**
```python
from shared.auth import encode_jwt, validate_jwt, ServiceUser

# Create JWT (in auth-service)
user = ServiceUser(
    user_id="user_123",
    email="user@example.com",
    organization_id="org_456",
    role="admin"
)
token = encode_jwt(user)

# Validate JWT (in other services)
user = validate_jwt(token)
if user:
    print(f"Authenticated: {user.email}")
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.12+
- uv (Python package manager)

### Environment Variables

All services use a **single centralized `.env` file** at the project root.

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` with your values:**
   ```env
   # Auth Service
   DATABASE_URL=postgresql+asyncpg://agentic:agentic_dev_password@localhost:5432/auth_db
   REDIS_URL=redis://localhost:6379
   
   # WorkOS Authentication
   WORKOS_API_KEY=your_workos_api_key
   WORKOS_CLIENT_ID=your_workos_client_id
   WORKOS_COOKIE_PASSWORD=your_cookie_password
   WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback
   
   # JWT (Cross-service auth)
   JWT_SECRET=your-secret-key-change-in-production
   JWT_ALGORITHM=HS256
   
   # Logging
   SERVICE_NAME=auth-service
   SERVICE_ENV=development
   LOG_LEVEL=INFO
   
   # LLM Providers (Optional)
   ANTHROPIC_API_KEY=your_anthropic_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

**Note:** All services read from the same `.env` file. Service-specific variables are prefixed (e.g., `AUTH_SERVICE_PORT`, `AGENT_SERVICE_PORT`).

### Running with Docker Compose

```bash
# Navigate to backend directory
cd backend

# Start all backend services (postgres, redis, auth-service)
docker-compose up -d

# View logs
docker-compose logs -f auth-service

# Stop all services
docker-compose down
```

### Running Locally (Development)

```bash
# Navigate to service directory
cd backend/auth-service

# Install dependencies
uv sync

# Run database migrations
uv run alembic upgrade head

# Start the service
uv run uvicorn app.main:app --reload --port 8000
```

### Database Migrations

```bash
cd backend/auth-service

# Create a new migration
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1
```

## Adding a New Service

1. **Create service directory:**
   ```bash
   mkdir backend/new-service
   ```

2. **Create logging config:**
   ```bash
   cp backend/configs/logging/auth-service.yaml \
      backend/configs/logging/new-service.yaml
   # Edit service name in the YAML
   ```

3. **Copy service template:**
   ```bash
   # Copy structure from auth-service
   cp -r backend/auth-service/app backend/new-service/
   cp backend/auth-service/pyproject.toml backend/new-service/
   cp backend/auth-service/Dockerfile backend/new-service/
   ```

4. **Update main.py:**
   ```python
   from shared.logging import setup_logging, get_logger
   from shared.auth import validate_jwt  # For auth
   
   setup_logging("configs/logging/new-service.yaml")
   logger = get_logger(__name__)
   ```

5. **Add to backend/docker-compose.yml:**
   ```yaml
   new-service:
     build:
       context: .
       dockerfile: ./new-service/Dockerfile
     environment:
       - DATABASE_URL=postgresql+asyncpg://agentic:agentic_dev_password@postgres:5432/new_db
       - SERVICE_NAME=new-service
       - JWT_SECRET=${JWT_SECRET}
     depends_on:
       - postgres
       - auth-service
   ```

6. **Create schema in migrations:**
   In your first Alembic migration:
   ```python
   def upgrade():
       op.execute("CREATE SCHEMA IF NOT EXISTS new_service")
       # Create tables in the schema
       op.create_table(
           'configs',
           sa.Column('id', sa.String(), primary_key=True),
           # ... other columns
           schema='new_service'
       )
   ```

## API Documentation

Each service exposes its own API documentation:

- **Auth Service:** http://localhost:8000/docs

## Testing

```bash
cd backend/auth-service

# Run tests
uv run pytest

# Run with coverage
uv run pytest --cov=app --cov-report=html
```

## Monitoring & Logging

### Log Files

Logs are written to `logs/{service-name}.log` with automatic rotation:
- Max size: 10 MB
- Backup count: 5 files
- Format: `timestamp - [service-name] - module - level - message`

### Viewing Logs

```bash
# Tail auth service logs
tail -f logs/auth-service.log

# Search for errors
grep "ERROR" logs/auth-service.log

# Docker logs
docker-compose logs -f auth-service
```

## Security

### JWT Tokens

- Set strong `JWT_SECRET` in production
- Tokens expire after 1 hour by default
- Use HTTPS in production

### Database

- Change default passwords in production
- Use connection pooling (configured in `database.py`)
- Enable SSL for database connections in production

### Environment Variables

- Never commit `.env` files
- Use secret management in production (AWS Secrets Manager, etc.)

## Troubleshooting

### Service won't start

1. Check database is running: `cd backend && docker-compose ps postgres`
2. Check logs: `docker-compose logs auth-service`
3. Verify environment variables are set in root `.env`

### Database connection errors

1. Ensure postgres is healthy: `cd backend && docker-compose ps`
2. Check database exists: `docker-compose exec postgres psql -U agentic -l`
3. Verify DATABASE_URL is correct in root `.env`

### Import errors with shared libraries

1. Ensure PYTHONPATH includes parent directory
2. Check `sys.path.insert()` in main.py
3. Verify shared libraries are mounted in `backend/docker-compose.yml`

## Contributing

When adding new features:
1. Follow the microservices pattern
2. Use shared libraries for common functionality
3. Document API endpoints
4. Write tests
5. Update this README

## License

[Your License Here]

