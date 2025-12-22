"""JWT utilities for cross-service authentication.

This module provides JWT encoding/decoding for service-to-service authentication.
Services can validate JWTs without calling the auth-service for every request.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

from shared.auth.models import ServiceUser


def _get_jwt_secret() -> str:
    """Get JWT secret from environment (uses ENCRYPTION_KEY)."""
    secret = os.getenv("ENCRYPTION_KEY", "")
    if not secret:
        raise ValueError("ENCRYPTION_KEY environment variable not set")
    return secret


def _get_jwt_algorithm() -> str:
    """Get JWT algorithm from environment."""
    return os.getenv("JWT_ALGORITHM", "HS256")


def encode_jwt(
    user: ServiceUser,
    expires_delta: timedelta | None = None,
    additional_claims: dict[str, Any] | None = None,
) -> str:
    """Encode a JWT token for cross-service authentication.
    
    Args:
        user: ServiceUser instance with user data
        expires_delta: Token expiration time (default: 1 hour)
        additional_claims: Additional claims to include in the token
    
    Returns:
        Encoded JWT token string
    """
    if expires_delta is None:
        expires_delta = timedelta(hours=1)
    
    expire = datetime.now(timezone.utc) + expires_delta
    
    # Build JWT payload
    payload = {
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "sub": user.user_id,
        **user.to_dict(),
    }
    
    # Add any additional claims
    if additional_claims:
        payload.update(additional_claims)
    
    # Encode JWT
    secret = _get_jwt_secret()
    algorithm = _get_jwt_algorithm()
    return jwt.encode(payload, secret, algorithm=algorithm)


def decode_jwt(token: str) -> dict[str, Any]:
    """Decode a JWT token.
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded JWT payload
    
    Raises:
        jwt.ExpiredSignatureError: Token has expired
        jwt.InvalidTokenError: Token is invalid
    """
    secret = _get_jwt_secret()
    algorithm = _get_jwt_algorithm()
    return jwt.decode(token, secret, algorithms=[algorithm])


def validate_jwt(token: str) -> ServiceUser | None:
    """Validate a JWT token and return ServiceUser.
    
    Args:
        token: JWT token string
    
    Returns:
        ServiceUser instance if valid, None otherwise
    """
    try:
        payload = decode_jwt(token)
        return ServiceUser.from_dict(payload)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError):
        return None


def refresh_jwt(token: str, expires_delta: timedelta | None = None) -> str | None:
    """Refresh an existing JWT token.
    
    Args:
        token: Existing JWT token
        expires_delta: New expiration time
    
    Returns:
        New JWT token if valid, None otherwise
    """
    user = validate_jwt(token)
    if user is None:
        return None
    
    return encode_jwt(user, expires_delta)

