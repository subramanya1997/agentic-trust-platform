"""Rate limiting utilities using SlowAPI and Redis."""

from slowapi import Limiter
from slowapi.util import get_remote_address


def create_limiter(
    redis_url: str,
    strategy: str = "fixed-window",
    headers_enabled: bool = True,
) -> Limiter:
    """
    Create and configure rate limiter with Redis backend.
    
    Args:
        redis_url: Redis connection URL (e.g., "redis://localhost:6379")
        strategy: Rate limiting strategy ("fixed-window" or "moving-window")
        headers_enabled: Whether to add rate limit headers to responses
    
    Returns:
        Configured Limiter instance
    """
    return Limiter(
        key_func=get_remote_address,
        storage_uri=redis_url,
        strategy=strategy,
        headers_enabled=headers_enabled,
    )

