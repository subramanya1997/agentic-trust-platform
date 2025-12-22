"""Configuration package for the application.

This package provides application configuration management. It exports the
Settings class and a singleton settings instance for use throughout the app.

Exports:
    - settings: Cached Settings instance (singleton)
    - get_settings(): Function to get cached Settings instance
    - Settings: Settings class for type hints

Usage:
    from app.config import settings
    
    # Access configuration
    db_url = settings.database_url
    workos_key = settings.workos_api_key
    
    # Settings are cached (singleton pattern)
    from app.config import get_settings
    assert settings is get_settings()  # True
"""

from app.config.settings import Settings, get_settings, settings

__all__ = [
    "settings",
    "get_settings",
    "Settings",
]

