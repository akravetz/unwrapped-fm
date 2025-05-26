"""Logging infrastructure for the application."""

import logging
import sys
from datetime import datetime
from typing import Any

from .config import settings


class StructuredFormatter(logging.Formatter):
    """Custom formatter that adds structured data to log records."""

    def format(self, record: logging.LogRecord) -> str:
        # Add timestamp
        record.timestamp = datetime.utcnow().isoformat()

        # Add environment info
        record.environment = settings.environment

        # Create structured log entry
        log_data = {
            "timestamp": record.timestamp,
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "environment": record.environment,
        }

        # Add extra fields if present
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id

        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id

        if hasattr(record, "spotify_endpoint"):
            log_data["spotify_endpoint"] = record.spotify_endpoint

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return str(log_data)


def setup_logging() -> None:
    """Configure application logging."""

    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(
        logging.INFO if settings.environment == "production" else logging.DEBUG
    )

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)

    if settings.environment == "development":
        # Simple format for development
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
    else:
        # Structured format for production
        formatter = StructuredFormatter()

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Suppress noisy third-party loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the specified name."""
    return logging.getLogger(name)


def log_spotify_api_call(
    logger: logging.Logger,
    endpoint: str,
    user_id: int | None = None,
    request_id: str | None = None,
    **kwargs: Any,
) -> None:
    """Log Spotify API calls with structured data."""
    extra = {
        "spotify_endpoint": endpoint,
        "user_id": user_id,
        "request_id": request_id,
        **kwargs,
    }
    logger.info(f"Spotify API call to {endpoint}", extra=extra)


def log_error_with_context(
    logger: logging.Logger,
    error: Exception,
    context: dict[str, Any],
    user_id: int | None = None,
    request_id: str | None = None,
) -> None:
    """Log errors with additional context."""
    extra = {"user_id": user_id, "request_id": request_id, "error_context": context}
    logger.error(f"Error occurred: {str(error)}", exc_info=True, extra=extra)


# Initialize logging when module is imported
setup_logging()
