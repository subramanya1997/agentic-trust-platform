"""Agentic Trust Auth Service - Main application entry point."""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
from shared.log_config import get_logger, setup_structured_logging
from shared.middleware import (
    ExceptionHandlerMiddleware,
    RequestContextMiddleware,
    SecurityHeadersMiddleware,
    create_limiter,
)
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette_prometheus import PrometheusMiddleware

from app.config import settings
from app.core.metrics import exceptions_total
from app.core.tracing import setup_tracing
from app.database import close_db, engine, init_db
from app.routers import audit, auth, health, organizations, permissions, team


def initialize_logging() -> None:
    """Initialize structured logging based on configuration settings."""
    setup_structured_logging(
        service_name=settings.service_name,
        environment=settings.service_env,
        version="0.1.0",
        log_level=settings.log_level,
        debug=settings.debug,
    )


# Initialize logging before creating the app
initialize_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    logger.info("Starting Agentic Trust API...")
    try:
        await init_db()
        logger.info("Database connected successfully")
    except Exception as e:
        logger.warning(f"Could not connect to database: {e}")
        logger.warning("Server will start, but database operations will fail")
        logger.warning("Make sure PostgreSQL is running: docker-compose up -d")
    
    logger.info(f"Application started - API URL: {settings.api_url}")
    yield
    
    # Shutdown
    logger.info("Shutting down Agentic Trust API...")
    try:
        await close_db()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")


app = FastAPI(
    title=settings.app_name,
    description="Agentic Trust - AI Agent Infrastructure Platform",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Security headers middleware (add first to ensure all responses have security headers)
app.add_middleware(SecurityHeadersMiddleware)

# Prometheus metrics middleware (add early for comprehensive metrics)
app.add_middleware(PrometheusMiddleware)

# Request context middleware (add for tracing and structured logging)
app.add_middleware(RequestContextMiddleware)

# Global exception handler (add after RequestContextMiddleware to access request_id)
app.add_middleware(
    ExceptionHandlerMiddleware,
    debug=settings.debug,
    metrics_counter=lambda exception_type: exceptions_total.labels(
        exception_type=exception_type
    ).inc(),
)

# Rate limiting setup
limiter = create_limiter(
    redis_url=settings.redis_url,
    strategy="fixed-window",
    headers_enabled=True,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS middleware with strict configuration
cors_origins = settings.cors_origins.copy()
if settings.frontend_url not in cors_origins:
    cors_origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=settings.cors_methods,
    allow_headers=settings.cors_headers,
    expose_headers=settings.cors_expose_headers,
    max_age=settings.cors_max_age,
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
app.include_router(team.router, prefix="/team", tags=["Team"])
app.include_router(permissions.router, prefix="/permissions", tags=["Permissions"])
app.include_router(audit.router, prefix="/audit", tags=["Audit Logs"])

# Mount Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Setup OpenTelemetry distributed tracing
setup_tracing(app, engine)

