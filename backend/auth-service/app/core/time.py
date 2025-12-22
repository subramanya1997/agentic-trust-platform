"""Time utilities for timezone-aware datetime handling."""

from datetime import UTC, datetime


def utc_now() -> datetime:
    """
    Get current UTC time as timezone-aware datetime.
    
    Replaces deprecated datetime.utcnow() which returns naive datetime.
    
    Returns:
        Timezone-aware datetime in UTC
    """
    return datetime.now(UTC)

