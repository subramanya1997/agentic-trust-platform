"""Application configuration loaded from environment variables."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_name: str = "Agentic Trust API"
    debug: bool = False
    api_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"

    # Database
    database_url: str = "postgresql+asyncpg://agentic:agentic_dev_password@localhost:5432/agentic_trust"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # WorkOS Authentication
    workos_api_key: str = ""
    workos_client_id: str = ""
    workos_cookie_password: str = ""
    workos_redirect_uri: str = "http://localhost:3000/auth/callback"

    # Encryption
    encryption_key: str = ""

    # LLM Providers
    anthropic_api_key: str | None = None
    openai_api_key: str | None = None

    # GCP
    gcp_project_id: str | None = None


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()

