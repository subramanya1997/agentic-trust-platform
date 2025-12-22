"""Shared logging setup with YAML configuration support."""

import logging
import os
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from typing import Any

import yaml


def _load_yaml_config(config_path: str) -> dict[str, Any]:
    """Load YAML configuration file."""
    with open(config_path) as f:
        return yaml.safe_load(f) or {}


def _merge_configs(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    """Recursively merge override config into base config."""
    result = base.copy()
    
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _merge_configs(result[key], value)
        else:
            result[key] = value
    
    return result


def _apply_env_overrides(config: dict[str, Any]) -> dict[str, Any]:
    """Apply environment variable overrides to config."""
    # Service name override
    if service_name := os.getenv("SERVICE_NAME"):
        if "service" not in config:
            config["service"] = {}
        config["service"]["name"] = service_name
    
    # Service environment override
    if service_env := os.getenv("SERVICE_ENV"):
        if "service" not in config:
            config["service"] = {}
        config["service"]["environment"] = service_env
    
    # Log level override
    if log_level := os.getenv("LOG_LEVEL"):
        if "logging" not in config:
            config["logging"] = {}
        config["logging"]["level"] = log_level
    
    # Log file path override
    if log_file := os.getenv("LOG_FILE"):
        if "logging" not in config:
            config["logging"] = {}
        if "file" not in config["logging"]:
            config["logging"]["file"] = {}
        config["logging"]["file"]["path"] = log_file
    
    return config


def setup_logging(service_config_path: str | None = None) -> None:
    """Configure application logging from YAML files.
    
    Args:
        service_config_path: Path to service-specific config YAML.
                           If None, uses base.yaml with environment variable overrides.
    """
    # Determine backend root from environment or default
    backend_root = Path(os.getenv("BACKEND_ROOT", "/app"))
    base_config_path = backend_root / "configs" / "logging" / "base.yaml"
    
    # Check for service config path from env if not provided
    if service_config_path is None:
        service_config_path = os.getenv("LOGGING_CONFIG_PATH")
    
    # Load base configuration
    if not base_config_path.exists():
        raise FileNotFoundError(f"Base logging config not found: {base_config_path}")
    
    config = _load_yaml_config(str(base_config_path))
    
    # Merge service-specific configuration
    if service_config_path and Path(service_config_path).exists():
        service_config = _load_yaml_config(service_config_path)
        config = _merge_configs(config, service_config)
    
    # Apply environment variable overrides
    config = _apply_env_overrides(config)
    
    # Extract configuration values
    service_name = config.get("service", {}).get("name", "unknown-service")
    logging_config = config.get("logging", {})
    log_level = getattr(logging, logging_config.get("level", "INFO").upper(), logging.INFO)
    log_format = logging_config.get("format", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    date_format = logging_config.get("date_format", "%Y-%m-%d %H:%M:%S")
    
    # Add service name to log format
    log_format = log_format.replace("%(service)s", service_name)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.handlers.clear()
    
    # File handler configuration
    file_config = logging_config.get("file", {})
    if file_config.get("enabled", True):
        log_file_path = Path(file_config.get("path", f"logs/{service_name}.log"))
        log_file_path.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = RotatingFileHandler(
            filename=str(log_file_path),
            maxBytes=file_config.get("max_bytes", 10485760),
            backupCount=file_config.get("backup_count", 5),
            encoding=file_config.get("encoding", "utf-8"),
        )
        file_handler.setLevel(log_level)
        file_formatter = logging.Formatter(log_format, datefmt=date_format)
        file_handler.setFormatter(file_formatter)
        root_logger.addHandler(file_handler)
    
    # Console handler configuration
    console_config = logging_config.get("console", {})
    if console_config.get("enabled", True):
        if console_config.get("colored", True):
            try:
                import colorlog
                
                console_handler = colorlog.StreamHandler(sys.stdout)
                console_handler.setLevel(log_level)
                
                colors = console_config.get("colors", {
                    "DEBUG": "cyan",
                    "INFO": "green",
                    "WARNING": "yellow",
                    "ERROR": "red",
                    "CRITICAL": "red,bg_white",
                })
                
                console_formatter = colorlog.ColoredFormatter(
                    f"%(log_color)s{log_format}",
                    datefmt=date_format,
                    log_colors=colors,
                )
                console_handler.setFormatter(console_formatter)
                root_logger.addHandler(console_handler)
            except ImportError:
                # Fallback to standard console handler
                console_handler = logging.StreamHandler(sys.stdout)
                console_handler.setLevel(log_level)
                console_formatter = logging.Formatter(log_format, datefmt=date_format)
                console_handler.setFormatter(console_formatter)
                root_logger.addHandler(console_handler)
        else:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setLevel(log_level)
            console_formatter = logging.Formatter(log_format, datefmt=date_format)
            console_handler.setFormatter(console_formatter)
            root_logger.addHandler(console_handler)
    
    # Configure third-party library loggers
    libraries_config = logging_config.get("libraries", {})
    for library_name, library_level in libraries_config.items():
        library_log_level = getattr(logging, library_level.upper(), logging.WARNING)
        logging.getLogger(library_name).setLevel(library_log_level)
    
    # Log startup message
    root_logger.info(f"Logging initialized for {service_name}")


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for a specific module."""
    return logging.getLogger(name)

