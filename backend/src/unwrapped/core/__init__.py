"""Core module exports."""

from .config import Settings, settings
from .database import get_session
from .dependencies import get_current_user_id
from .exceptions import (
    AuthenticationError,
    MusicDataError,
    RateLimitError,
    SpotifyAPIError,
    TokenExpiredError,
    UnwrappedFMException,
)
from .security import (
    create_access_token,
    create_user_token,
    get_password_hash,
    verify_password,
    verify_token,
)

__all__ = [
    # Config
    "Settings",
    "settings",
    # Database
    "get_session",
    # Dependencies
    "get_current_user_id",
    # Exceptions
    "AuthenticationError",
    "MusicDataError",
    "RateLimitError",
    "SpotifyAPIError",
    "TokenExpiredError",
    "UnwrappedFMException",
    # Security
    "create_access_token",
    "create_user_token",
    "get_password_hash",
    "verify_password",
    "verify_token",
]
