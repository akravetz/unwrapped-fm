"""Authentication domain for unwrapped application."""

from .models import AuthResponse, SpotifyToken, User, UserCreate, UserRead, UserUpdate
from .router import router as auth_router
from .service import UserService
from .spotify import SpotifyAuthClient, spotify_auth_client

__all__ = [
    # Models
    "AuthResponse",
    "SpotifyToken",
    "User",
    "UserCreate",
    "UserRead",
    "UserUpdate",
    # Router
    "auth_router",
    # Service
    "UserService",
    # Spotify
    "SpotifyAuthClient",
    "spotify_auth_client",
]
