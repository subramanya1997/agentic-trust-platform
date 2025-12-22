"""Database connection and session management.

This module provides database connection pooling, session management, and
database initialization utilities. It uses SQLAlchemy async engine with
connection pooling optimized for the application's workload.

Key Features:
- Async database engine with connection pooling
- Dynamic pool sizing based on CPU count
- Connection health checks (pool_pre_ping)
- Automatic connection recycling
- Proper error handling and rollback
- PostgreSQL-specific optimizations

Connection Pool Configuration:
    - Pool Size: CPU count × 2 (default) or configured via DB_POOL_SIZE
    - Max Overflow: CPU count × 4 (default) or configured via DB_MAX_OVERFLOW
    - Pool Timeout: 30 seconds (configurable)
    - Pool Recycle: 1 hour (prevents stale connections)
    - Connection Timeout: 5 seconds
    - Command Timeout: 30 seconds

Usage:
    from app.database import get_db, init_db, close_db
    
    # In route handlers
    @router.get("/users")
    async def get_users(db: AsyncSession = Depends(get_db)):
        users = await db.execute(select(User))
        return users.scalars().all()
    
    # Initialize database (on startup)
    await init_db()
    
    # Close connections (on shutdown)
    await close_db()
"""

import logging
import os
from collections.abc import AsyncGenerator

from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.config import settings
from shared.exceptions import DatabaseError

logger = logging.getLogger(__name__)

# Calculate optimal pool sizes based on environment
# Default: 2 connections per CPU core, 4 overflow connections per CPU core
# This balances performance with resource usage
cpu_count = os.cpu_count() or 4
default_pool_size = cpu_count * 2
default_max_overflow = cpu_count * 4

# Use configured values or calculated defaults
# Allows override via environment variables for fine-tuning
pool_size = settings.db_pool_size or default_pool_size
max_overflow = settings.db_max_overflow or default_max_overflow

logger.info(
    f"Configuring database connection pool: pool_size={pool_size}, "
    f"max_overflow={max_overflow}, timeout={settings.db_pool_timeout}s"
)

# Create async engine with dynamic pooling configuration
# This engine is shared across all database operations
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,  # Log SQL queries in debug mode
    pool_pre_ping=True,  # Verify connections before using (prevents stale connection errors)
    pool_size=pool_size,  # Number of connections to maintain in pool
    max_overflow=max_overflow,  # Maximum overflow connections beyond pool_size
    pool_timeout=settings.db_pool_timeout,  # Seconds to wait for connection from pool
    pool_recycle=settings.db_pool_recycle,  # Recycle connections after this many seconds
    connect_args={
        "timeout": 5,  # Connection timeout in seconds
        "command_timeout": 30,  # Command timeout in seconds
        "server_settings": {
            "application_name": settings.app_name,  # For PostgreSQL logging and monitoring
        },
    },
)

# Create session factory
# This factory creates new database sessions for each request
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Keep objects accessible after commit
    autocommit=False,  # Require explicit commits
    autoflush=False,  # Require explicit flushes
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for getting database sessions.
    
    This function provides a database session for each request. It handles
    error recovery, automatic rollback on errors, and proper session cleanup.
    
    Important Notes:
    - Does NOT auto-commit: Handlers must explicitly call `await db.commit()`
    - Read-only operations don't need commits
    - Mutations (INSERT, UPDATE, DELETE) require explicit commit
    - Automatic rollback on any exception
    - Session is automatically closed after request completes
    
    Error Handling:
    - SQLAlchemy errors are caught and converted to DatabaseError
    - All errors trigger automatic rollback
    - Errors are logged with full context
    
    Usage:
        @router.post("/users")
        async def create_user(
            data: UserCreate,
            db: AsyncSession = Depends(get_db)
        ):
            user = User(**data.dict())
            db.add(user)
            await db.commit()  # Explicit commit required
            await db.refresh(user)
            return user
        
        @router.get("/users")
        async def list_users(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(User))
            return result.scalars().all()  # No commit needed for reads
    
    Yields:
        AsyncSession: Database session for the current request
        
    Raises:
        DatabaseError: If a database error occurs (with automatic rollback)
    """
    async with async_session_maker() as session:
        try:
            yield session
            # No auto-commit - handlers must explicitly commit for mutations
            # This gives developers explicit control over transaction boundaries
        except (SQLAlchemyError, IntegrityError, OperationalError) as e:
            # Rollback on database errors
            await session.rollback()
            logger.error(
                "Database error occurred",
                exc_info=True,
                extra={"error_type": type(e).__name__, "error": str(e)},
            )
            # Convert to our custom exception type
            raise DatabaseError(f"Database operation failed: {e!s}", {"original_error": str(e)})
        except Exception as e:
            # Rollback on any unexpected error
            await session.rollback()
            logger.error(
                "Unexpected error in database session",
                exc_info=True,
                extra={"error_type": type(e).__name__, "error": str(e)},
            )
            raise
        finally:
            # Always close session, even if error occurred
            await session.close()


async def init_db() -> None:
    """Initialize database tables.
    
    Creates all database tables defined in SQLModel models. This is typically
    called during application startup or in migration scripts.
    
    Note:
        In production, use Alembic migrations instead of this function.
        This function is useful for development and testing.
    
    Usage:
        # In application startup
        @asynccontextmanager
        async def lifespan(app: FastAPI):
            await init_db()
            yield
            await close_db()
    
    Raises:
        SQLAlchemyError: If table creation fails
    """
    async with engine.begin() as conn:
        # Create all tables defined in SQLModel models
        await conn.run_sync(SQLModel.metadata.create_all)


async def close_db() -> None:
    """Close database connections.
    
    Disposes of the database engine and closes all connection pool connections.
    This should be called during application shutdown to ensure clean teardown.
    
    Usage:
        # In application shutdown
        @asynccontextmanager
        async def lifespan(app: FastAPI):
            yield
            await close_db()
    
    Note:
        After calling this, the engine cannot be used again. Create a new
        engine if you need to reconnect.
    """
    await engine.dispose()

