# Agentic Trust Shared

Shared utilities and libraries for Agentic Trust Platform services.

## Contents

- **auth**: JWT and authentication utilities
- **log_config**: Centralized logging configuration (legacy YAML-based and modern structured logging)
- **middleware**: Shared middleware components for FastAPI services

## Installation

This package is installed as an editable dependency by other services in the monorepo:

```bash
# From a service directory (e.g., auth-service)
uv sync
```

## Usage

### Structured Logging (Recommended)

Modern structured logging with request correlation, JSON output for production, and colored console for development:

```python
from shared.log_config import get_logger, setup_structured_logging
from shared.middleware import RequestContextMiddleware

# In your FastAPI app setup
setup_structured_logging(
    service_name="my-service",
    environment="production",  # or "development"
    version="1.0.0",
    log_level="INFO",
    debug=False,  # True for colored console, False for JSON
)

# Add middleware for automatic request context
app.add_middleware(RequestContextMiddleware)

# Use logger in your code
logger = get_logger(__name__)
logger.info("User logged in", user_id="123", action="login")
```

**Features:**
- Automatic request_id, org_id, user_id, trace_id in every log
- JSON format in production for log aggregation (GCP Logging, ELK, Datadog)
- Colored console output in development
- OpenTelemetry trace correlation
- Context variables for request-scoped logging

### Legacy Logging (YAML-based)

```python
from shared.log_config import setup_logging, get_logger_legacy

setup_logging("path/to/config.yaml")
logger = get_logger_legacy(__name__)
```

### JWT Utilities

```python
from shared.auth.jwt import create_access_token, verify_token
```

## Development

Run tests:

```bash
cd backend/shared
uv run pytest
```

