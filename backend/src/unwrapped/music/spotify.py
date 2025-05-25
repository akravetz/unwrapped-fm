"""Spotify API client for music data operations."""

import asyncio
from typing import Any

import httpx
from pydantic import BaseModel

from ..core.config import settings
from ..core.exceptions import SpotifyAPIError


class SpotifyTokenInfo(BaseModel):
    """Spotify token information."""

    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "Bearer"
    scope: str | None = None


class SpotifyMusicClient:
    """Spotify API client for music operations."""

    BASE_URL = "https://api.spotify.com/v1"
    AUTH_URL = "https://accounts.spotify.com/api/token"

    def __init__(self):
        self.settings = settings
        self.client: httpx.AsyncClient | None = None

    async def __aenter__(self):
        """Async context manager entry."""
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.client:
            await self.client.aclose()

    def _get_client(self) -> httpx.AsyncClient:
        """Get HTTP client, create if needed."""
        if self.client is None:
            self.client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0),
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
            )
        return self.client

    async def _make_request(
        self,
        method: str,
        url: str,
        headers: dict[str, str] | None = None,
        params: dict[str, Any] | None = None,
        data: dict[str, Any] | None = None,
        retries: int = 3,
    ) -> dict[str, Any]:
        """Make HTTP request with retry logic and error handling."""
        client = self._get_client()

        for attempt in range(retries + 1):
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    params=params,
                    data=data,
                )

                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 204:
                    return {}
                elif response.status_code == 429:
                    # Rate limited - wait and retry
                    retry_after = int(response.headers.get("retry-after", 1))
                    if attempt < retries:
                        await asyncio.sleep(retry_after)
                        continue
                    raise SpotifyAPIError(
                        f"Rate limit exceeded. Retry after {retry_after} seconds"
                    )
                elif response.status_code == 401:
                    raise SpotifyAPIError("Invalid or expired access token")
                elif response.status_code == 403:
                    raise SpotifyAPIError("Insufficient permissions")
                elif response.status_code == 404:
                    raise SpotifyAPIError("Resource not found")
                else:
                    error_data = response.json() if response.content else {}
                    error_msg = error_data.get("error", {}).get(
                        "message", f"HTTP {response.status_code}"
                    )
                    raise SpotifyAPIError(f"Spotify API error: {error_msg}")

            except httpx.RequestError as e:
                if attempt < retries:
                    await asyncio.sleep(2**attempt)  # Exponential backoff
                    continue
                raise SpotifyAPIError(f"Network error: {e}") from e
            except SpotifyAPIError:
                raise
            except Exception as e:
                raise SpotifyAPIError(f"Unexpected error: {e}") from e

        raise SpotifyAPIError("Max retries exceeded")

    async def refresh_access_token(self, refresh_token: str) -> SpotifyTokenInfo:
        """Refresh Spotify access token."""
        try:
            headers = {
                "Content-Type": "application/x-www-form-urlencoded",
            }

            data = {
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": self.settings.spotify_client_id,
                "client_secret": self.settings.spotify_client_secret,
            }

            response_data = await self._make_request(
                method="POST",
                url=self.AUTH_URL,
                headers=headers,
                data=data,
            )

            # If no new refresh token provided, keep the old one
            if "refresh_token" not in response_data:
                response_data["refresh_token"] = refresh_token

            return SpotifyTokenInfo(**response_data)

        except Exception as e:
            raise SpotifyAPIError(f"Failed to refresh token: {e}") from e

    async def get_user_top_tracks(
        self,
        access_token: str,
        time_range: str = "medium_term",
        limit: int = 50,
        offset: int = 0,
    ) -> dict[str, Any]:
        """Get user's top tracks."""
        headers = {"Authorization": f"Bearer {access_token}"}
        params = {
            "time_range": time_range,
            "limit": min(limit, 50),  # Spotify max is 50
            "offset": offset,
        }

        return await self._make_request(
            method="GET",
            url=f"{self.BASE_URL}/me/top/tracks",
            headers=headers,
            params=params,
        )

    async def get_user_top_artists(
        self,
        access_token: str,
        time_range: str = "medium_term",
        limit: int = 50,
        offset: int = 0,
    ) -> dict[str, Any]:
        """Get user's top artists."""
        headers = {"Authorization": f"Bearer {access_token}"}
        params = {
            "time_range": time_range,
            "limit": min(limit, 50),  # Spotify max is 50
            "offset": offset,
        }

        return await self._make_request(
            method="GET",
            url=f"{self.BASE_URL}/me/top/artists",
            headers=headers,
            params=params,
        )

    async def get_recently_played(
        self,
        access_token: str,
        limit: int = 50,
        after: int | None = None,
        before: int | None = None,
    ) -> dict[str, Any]:
        """Get user's recently played tracks."""
        headers = {"Authorization": f"Bearer {access_token}"}
        params = {"limit": min(limit, 50)}  # Spotify max is 50

        if after:
            params["after"] = after
        if before:
            params["before"] = before

        return await self._make_request(
            method="GET",
            url=f"{self.BASE_URL}/me/player/recently-played",
            headers=headers,
            params=params,
        )

    async def get_audio_features(
        self,
        access_token: str,
        track_ids: list[str],
    ) -> dict[str, Any]:
        """Get audio features for tracks (batch up to 100)."""
        if not track_ids:
            return {"audio_features": []}

        # Spotify allows up to 100 tracks per request
        if len(track_ids) > 100:
            track_ids = track_ids[:100]

        headers = {"Authorization": f"Bearer {access_token}"}
        params = {"ids": ",".join(track_ids)}

        return await self._make_request(
            method="GET",
            url=f"{self.BASE_URL}/audio-features",
            headers=headers,
            params=params,
        )

    async def get_track_details(
        self,
        access_token: str,
        track_ids: list[str],
    ) -> dict[str, Any]:
        """Get detailed track information (batch up to 50)."""
        if not track_ids:
            return {"tracks": []}

        # Spotify allows up to 50 tracks per request
        if len(track_ids) > 50:
            track_ids = track_ids[:50]

        headers = {"Authorization": f"Bearer {access_token}"}
        params = {"ids": ",".join(track_ids)}

        return await self._make_request(
            method="GET",
            url=f"{self.BASE_URL}/tracks",
            headers=headers,
            params=params,
        )

    async def get_artist_details(
        self,
        access_token: str,
        artist_ids: list[str],
    ) -> dict[str, Any]:
        """Get detailed artist information (batch up to 50)."""
        if not artist_ids:
            return {"artists": []}

        # Spotify allows up to 50 artists per request
        if len(artist_ids) > 50:
            artist_ids = artist_ids[:50]

        headers = {"Authorization": f"Bearer {access_token}"}
        params = {"ids": ",".join(artist_ids)}

        return await self._make_request(
            method="GET",
            url=f"{self.BASE_URL}/artists",
            headers=headers,
            params=params,
        )

    async def get_current_user(self, access_token: str) -> dict[str, Any]:
        """Get current user profile."""
        headers = {"Authorization": f"Bearer {access_token}"}

        return await self._make_request(
            method="GET",
            url=f"{self.BASE_URL}/me",
            headers=headers,
        )

    async def close(self):
        """Close the HTTP client."""
        if self.client:
            await self.client.aclose()
            self.client = None


# Global client instance
spotify_music_client = SpotifyMusicClient()
