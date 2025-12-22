"""Application configuration loaded from environment variables.

This module defines the Settings class that loads and validates all application
configuration from environment variables. It uses Pydantic for validation and
type safety.

Key Features:
- Environment variable loading with validation
- Type-safe configuration with Pydantic
- Required field validation on startup
- Security key strength validation
- Sensible defaults for optional settings
- Cached settings instance (singleton pattern)

Configuration Sources:
1. Environment variables (primary)
2. .env file (if present)
3. Default values (for optional settings)

Security:
- Validates minimum key lengths for encryption keys
- Requires all secrets to be set (no defaults for sensitive data)
- Validates cookie password strength

Usage:
    from app.config import settings
    
    # Access configuration
    db_url = settings.database_url
    workos_key = settings.workos_api_key
    
    # Settings are cached (singleton)
    assert settings is get_settings()  # True
"""

from functools import lru_cache

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    This class defines all configuration settings for the auth service.
    Settings are loaded from environment variables with validation and type
    checking. Required settings must be provided, optional settings have
    sensible defaults.
    
    Configuration Loading:
        - Reads from environment variables (case-insensitive)
        - Falls back to .env file if present
        - Validates all required fields on instantiation
        - Caches instance for performance (singleton)
    
    Required Settings:
        - DATABASE_URL: PostgreSQL connection string
        - WORKOS_API_KEY: WorkOS API key
        - WORKOS_CLIENT_ID: WorkOS client ID
        - WORKOS_COOKIE_PASSWORD: Cookie encryption password (min 32 chars)
        - ENCRYPTION_KEY: Encryption key for JWT (min 32 chars)
    
    Optional Settings:
        - Most settings have defaults suitable for development
        - Production should override defaults via environment variables
    
    Validation:
        - Security keys must be at least 32 characters
        - All required secrets validated on startup
        - Database URL format validated by SQLAlchemy
    
    Example:
        # In .env file or environment:
        DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db
        WORKOS_API_KEY=sk_test_...
        WORKOS_CLIENT_ID=client_...
        WORKOS_COOKIE_PASSWORD=your-32-character-cookie-password-here
        ENCRYPTION_KEY=your-32-character-encryption-key-here
    """

    model_config = SettingsConfigDict(
        env_file=".env",  # Load from .env file if present
        env_file_encoding="utf-8",  # UTF-8 encoding for .env file
        case_sensitive=False,  # Environment variable names are case-insensitive
    )

    # App
    app_name: str = "Agentic Trust API"
    debug: bool = False
    api_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"

    # Database (single database with schema separation)
    # NO default credentials - must be explicitly set
    database_url: str = Field(
        ...,
        description="Database connection string (required)",
        min_length=1,
    )
    db_schema: str = "auth"  # Schema for auth service tables
    
    # Database connection pooling (optional overrides)
    db_pool_size: int | None = None  # Defaults to cpu_count * 2
    db_max_overflow: int | None = None  # Defaults to cpu_count * 4
    db_pool_timeout: int = 30  # Seconds to wait for connection from pool
    db_pool_recycle: int = 3600  # Recycle connections after 1 hour

    # Redis
    redis_url: str = "redis://redis:6379"  # Use service name for Docker networking

    # CORS Configuration
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000"],
        description="Allowed CORS origins"
    )
    cors_methods: list[str] = Field(
        default_factory=lambda: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        description="Allowed HTTP methods"
    )
    cors_headers: list[str] = Field(
        default_factory=lambda: [
            "Content-Type",
            "Authorization",
            "X-Organization-ID",
            "X-Request-ID",
        ],
        description="Allowed HTTP headers"
    )
    cors_expose_headers: list[str] = Field(
        default_factory=lambda: ["X-Total-Count", "X-Page-Count", "X-Request-ID"],
        description="Headers exposed to browser"
    )
    cors_max_age: int = 3600  # Cache preflight for 1 hour

    # WorkOS Authentication - all required
    workos_api_key: str = Field(..., min_length=1, description="WorkOS API key (required)")
    workos_client_id: str = Field(..., min_length=1, description="WorkOS client ID (required)")
    workos_cookie_password: str = Field(
        ..., min_length=32, description="WorkOS cookie password - min 32 characters (required)"
    )
    workos_redirect_uri: str = "http://localhost:3000/auth/callback"

    # Encryption (also used for JWT signing) - required with minimum length
    encryption_key: str = Field(
        ..., min_length=32, description="Encryption key - min 32 characters (required)"
    )

    # JWT settings
    jwt_algorithm: str = "HS256"

    # LLM Providers
    anthropic_api_key: str | None = None
    openai_api_key: str | None = None

    # GCP
    gcp_project_id: str | None = None

    # Logging
    service_name: str = "auth-service"
    service_env: str = "development"
    log_level: str = "INFO"
    log_config_path: str | None = None  # Optional path to service-specific logging config

    # Session Cookie Configuration
    session_cookie_name: str = "wos-session"
    session_cookie_max_age: int = 60 * 60 * 24 * 7  # 7 days in seconds
    session_cookie_path: str = "/"
    session_cookie_samesite: str = "lax"
    
    # OAuth CSRF Protection
    oauth_state_cookie_name: str = "oauth_state"
    oauth_state_max_age: int = 600  # 10 minutes

    @field_validator("workos_cookie_password", "encryption_key")
    @classmethod
    def validate_key_strength(cls, v: str) -> str:
        """Validate that security keys are strong enough."""
        if len(v) < 32:
            raise ValueError("Security keys must be at least 32 characters long")
        return v

    @model_validator(mode="after")
    def validate_required_secrets(self) -> "Settings":
        """Validate all required secrets are present on startup."""
        required_secrets = {
            "database_url": self.database_url,
            "workos_api_key": self.workos_api_key,
            "workos_client_id": self.workos_client_id,
            "workos_cookie_password": self.workos_cookie_password,
            "encryption_key": self.encryption_key,
        }

        missing = [name for name, value in required_secrets.items() if not value]
        if missing:
            raise ValueError(
                f"Missing required secrets: {', '.join(missing)}. "
                "Please set these environment variables or add them to .env file."
            )

        return self
    
    @property
    def session_cookie_secure(self) -> bool:
        """Session cookie secure flag - enabled in production."""
        return not self.debug



@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()

