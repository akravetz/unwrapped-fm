"""Spotify OAuth client for authentication."""

import base64
from urllib.parse import urlencode

import httpx

from ..core.config import settings
from ..core.exceptions import SpotifyAPIError
from .models import SpotifyToken


class SpotifyAuthClient:
    """Spotify OAuth authentication client.

    IMPORTANT: OAuth Configuration
    - Uses 127.0.0.1 for development consistency (not localhost)
    - Spotify app dashboard must have exact redirect URI: https://127.0.0.1:8443/api/v1/auth/callback
    - This ensures reliable OAuth flow across different browsers and operating systems
    """

    def __init__(self):
        self.client_id = settings.spotify_client_id
        self.client_secret = settings.spotify_client_secret
        self.redirect_uri = settings.spotify_redirect_uri
        self.base_url = "https://api.spotify.com/v1"
        self.auth_url = "https://accounts.spotify.com/authorize"
        self.token_url = "https://accounts.spotify.com/api/token"

    def get_auth_url(self, state: str | None = None) -> str:
        """Generate Spotify OAuth authorization URL."""
        if not self.client_id:
            raise SpotifyAPIError("Spotify client ID not configured")

        params = {
            "client_id": self.client_id,
            "response_type": "code",
            "redirect_uri": self.redirect_uri,
            "scope": " ".join(
                [
                    "user-read-private",
                    "user-read-email",
                    "user-read-recently-played",
                    "user-top-read",
                    "user-library-read",
                ]
            ),
        }

        if state:
            params["state"] = state

        return f"{self.auth_url}?{urlencode(params)}"

    async def exchange_code_for_token(self, code: str) -> SpotifyToken:
        """Exchange authorization code for access token."""
        if not self.client_id or not self.client_secret:
            raise SpotifyAPIError("Spotify credentials not configured")

        # Prepare basic auth header
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()

        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        }

        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": self.redirect_uri,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(self.token_url, headers=headers, data=data)

            if response.status_code != 200:
                raise SpotifyAPIError(
                    f"Failed to exchange code for token: {response.text}"
                )

            token_data = response.json()
            return SpotifyToken(**token_data)

    async def refresh_access_token(self, refresh_token: str) -> SpotifyToken:
        """Refresh an expired access token."""
        if not self.client_id or not self.client_secret:
            raise SpotifyAPIError("Spotify credentials not configured")

        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()

        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        }

        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(self.token_url, headers=headers, data=data)

            if response.status_code != 200:
                raise SpotifyAPIError(f"Failed to refresh token: {response.text}")

            token_data = response.json()
            # Refresh tokens might not return a new refresh token
            if "refresh_token" not in token_data:
                token_data["refresh_token"] = refresh_token

            return SpotifyToken(**token_data)

    async def get_current_user(self, access_token: str) -> dict:
        """Get current user profile from Spotify."""
        headers = {"Authorization": f"Bearer {access_token}"}

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/me", headers=headers)

            if response.status_code != 200:
                raise SpotifyAPIError(f"Failed to get user profile: {response.text}")

            return response.json()


# Global auth client instance
spotify_auth_client = SpotifyAuthClient()
