"""Redis caching service for performance optimization."""

import json
import logging
from typing import Any

from redis import asyncio as aioredis

from app.config import settings

logger = logging.getLogger(__name__)


class CacheService:
    """
    Redis-backed caching service implementing cache-aside pattern.
    
    This service provides caching for frequently accessed, rarely changed data
    to reduce database load and improve response times.
    """

    def __init__(self, redis_url: str | None = None):
        """
        Initialize cache service.
        
        Args:
            redis_url: Redis connection URL (defaults to settings.redis_url)
        """
        self.redis_url = redis_url or settings.redis_url
        self._redis: aioredis.Redis | None = None

    async def _get_redis(self) -> aioredis.Redis:
        """Get or create Redis connection."""
        if self._redis is None:
            self._redis = await aioredis.from_url(
                self.redis_url,
                decode_responses=True,
                encoding="utf-8",
            )
        return self._redis

    async def get(self, key: str) -> Any | None:
        """
        Get value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value (deserialized from JSON) or None if not found
        """
        try:
            redis = await self._get_redis()
            value = await redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.warning(f"Cache get failed for key {key}", extra={"error": str(e)})
            return None

    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """
        Set value in cache with TTL.
        
        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds (default: 5 minutes)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            redis = await self._get_redis()
            serialized = json.dumps(value, default=str)
            await redis.setex(key, ttl, serialized)
            return True
        except Exception as e:
            logger.warning(f"Cache set failed for key {key}", extra={"error": str(e)})
            return False

    async def delete(self, key: str) -> bool:
        """
        Delete value from cache.
        
        Args:
            key: Cache key to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            redis = await self._get_redis()
            await redis.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Cache delete failed for key {key}", extra={"error": str(e)})
            return False

    async def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching a pattern.
        
        Args:
            pattern: Redis key pattern (e.g., "user:*")
            
        Returns:
            Number of keys deleted
        """
        try:
            redis = await self._get_redis()
            keys = []
            async for key in redis.scan_iter(match=pattern):
                keys.append(key)
            
            if keys:
                await redis.delete(*keys)
                return len(keys)
            return 0
        except Exception as e:
            logger.warning(f"Cache delete pattern failed for {pattern}", extra={"error": str(e)})
            return 0

    async def close(self):
        """Close Redis connection."""
        if self._redis:
            await self._redis.aclose()
            self._redis = None


# Cache key prefixes for organization
CACHE_PREFIX_ORG = "org"
CACHE_PREFIX_USER = "user"
CACHE_PREFIX_TEAM = "team"

# Cache TTLs (in seconds)
CACHE_TTL_ORG = 600  # 10 minutes
CACHE_TTL_USER = 300  # 5 minutes
CACHE_TTL_TEAM = 120  # 2 minutes


def make_cache_key(prefix: str, *args: str) -> str:
    """
    Create a cache key with consistent formatting.
    
    Args:
        prefix: Cache key prefix (e.g., "org", "user")
        *args: Additional key components
        
    Returns:
        Formatted cache key (e.g., "org:123", "user:456:profile")
    """
    return ":".join([prefix, *args])

