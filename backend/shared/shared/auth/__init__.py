"""Shared authentication utilities for cross-service communication.

This package provides JWT utilities for service-to-service authentication.
It allows services to validate JWTs without calling the auth-service for
every request.

Exports:
    - encode_jwt: Create JWT token for service-to-service auth
    - decode_jwt: Decode JWT token (low-level)
    - validate_jwt: Validate JWT and return ServiceUser
    - ServiceUser: Lightweight user model for cross-service communication

Usage:
    from shared.auth import encode_jwt, validate_jwt, ServiceUser
    
    # In auth-service: Create token
    user = ServiceUser(user_id="user_123", email="user@example.com")
    token = encode_jwt(user)
    
    # In other services: Validate token
    user = validate_jwt(token)
    if user:
        print(f"Authenticated: {user.email}")
"""

from shared.auth.jwt import decode_jwt, encode_jwt, validate_jwt
from shared.auth.models import ServiceUser

__all__ = ["encode_jwt", "decode_jwt", "validate_jwt", "ServiceUser"]

