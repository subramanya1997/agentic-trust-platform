# Shared Auth Module

## Purpose

This module provides JWT utilities for **future cross-service authentication** when the platform expands to multiple microservices beyond the auth-service.

## Current Status

⚠️ **NOT CURRENTLY IN USE**

The auth-service currently uses WorkOS sealed sessions for authentication, not these JWT utilities. This module is reserved for future use when additional microservices need to validate authentication without calling the auth-service for every request.

## Intended Use Case

When you build additional services (e.g., agent-service, execution-service), they can:

1. Receive a JWT token from the auth-service (or extract from sealed session)
2. Use `validate_jwt()` to verify the token locally
3. Extract `ServiceUser` data without making external API calls

## Example Future Usage

```python
from shared.auth import validate_jwt, ServiceUser

# In another microservice
def get_current_user(token: str) -> ServiceUser | None:
    return validate_jwt(token)
```

## Components

- **`models.py`**: `ServiceUser` - Lightweight user model for cross-service communication
- **`jwt.py`**: JWT encoding/decoding utilities
  - `encode_jwt()` - Create JWT tokens
  - `decode_jwt()` - Decode JWT tokens
  - `validate_jwt()` - Validate and extract ServiceUser
  - `refresh_jwt()` - Refresh existing tokens

## Migration Path

When you need to use this module:

1. Modify the auth-service to generate JWT tokens alongside WorkOS sessions
2. Add the JWT token to API responses or headers
3. Import and use in other microservices for authentication
4. Update the `ServiceUser` model if additional fields are needed

## Related Documentation

See [`backend/README.md`](../README.md) sections on:
- Cross-Service Authentication
- Service-to-Service Communication

