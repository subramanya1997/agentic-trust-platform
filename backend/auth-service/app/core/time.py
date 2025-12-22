"""Time utilities for timezone-aware datetime handling.

This module provides timezone-aware datetime utilities to ensure consistent
time handling across the application. It replaces deprecated naive datetime
functions with timezone-aware alternatives.

Key Features:
- Timezone-aware UTC timestamps
- Consistent time handling across the application
- Replaces deprecated datetime.utcnow()

Usage:
    from app.core.time import utc_now
    
    # Get current UTC time
    now = utc_now()
    # Returns: datetime.datetime(2024, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
"""

from datetime import UTC, datetime


def utc_now() -> datetime:
    """
    Get current UTC time as timezone-aware datetime.
    
    This function replaces the deprecated datetime.utcnow() which returns
    a naive datetime object. This function returns a timezone-aware datetime
    in UTC, which is essential for proper time handling in distributed systems.
    
    Why timezone-aware?
    - Prevents timezone-related bugs
    - Ensures consistent time storage in database
    - Required for proper datetime comparisons
    - Essential for distributed systems across timezones
    
    Returns:
        datetime: Timezone-aware datetime object in UTC
        
    Example:
        >>> now = utc_now()
        >>> now.tzinfo
        datetime.timezone.utc
        >>> now.isoformat()
        '2024-01-01T12:00:00+00:00'
        
    Note:
        This function is used as a default factory for datetime fields
        in SQLModel models (see app.models.base.BaseModel).
    """
    return datetime.now(UTC)

