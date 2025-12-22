"""Shared authentication utilities for cross-service communication."""

from shared.auth.jwt import decode_jwt, encode_jwt, validate_jwt
from shared.auth.models import ServiceUser

__all__ = ["encode_jwt", "decode_jwt", "validate_jwt", "ServiceUser"]

