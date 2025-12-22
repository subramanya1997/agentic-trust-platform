"""Database connection and session management."""

import logging
import os
from collections.abc import AsyncGenerator

from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.config import settings
from app.core.exceptions import DatabaseError

logger = logging.getLogger(__name__)

# Calculate optimal pool sizes based on environment
cpu_count = os.cpu_count() or 4
default_pool_size = cpu_count * 2
default_max_overflow = cpu_count * 4

# Use configured values or calculated defaults
pool_size = settings.db_pool_size or default_pool_size
max_overflow = settings.db_max_overflow or default_max_overflow

logger.info(
    f"Configuring database connection pool: pool_size={pool_size}, "
    f"max_overflow={max_overflow}, timeout={settings.db_pool_timeout}s"
)

# Create async engine with dynamic pooling configuration
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=pool_size,
    max_overflow=max_overflow,
    pool_timeout=settings.db_pool_timeout,
    pool_recycle=settings.db_pool_recycle,  # Recycle connections periodically
    connect_args={
        "timeout": 5,  # Connection timeout in seconds
        "command_timeout": 30,  # Command timeout in seconds
        "server_settings": {
            "application_name": settings.app_name,  # For PostgreSQL logging
        },
    },
)

# Create session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting database sessions.
    
    Note: This does NOT auto-commit. Handlers must explicitly call
    await db.commit() for mutations. Read-only operations don't need commits.
    """
    async with async_session_maker() as session:
        try:
            yield session
            # No auto-commit - handlers must explicitly commit for mutations
        except (SQLAlchemyError, IntegrityError, OperationalError) as e:
            await session.rollback()
            logger.error(
                "Database error occurred",
                exc_info=True,
                extra={"error_type": type(e).__name__, "error": str(e)},
            )
            raise DatabaseError(f"Database operation failed: {e!s}", {"original_error": str(e)})
        except Exception as e:
            await session.rollback()
            logger.error(
                "Unexpected error in database session",
                exc_info=True,
                extra={"error_type": type(e).__name__, "error": str(e)},
            )
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()

