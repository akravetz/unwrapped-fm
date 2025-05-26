"""Spotify data collection service for music analysis."""

from typing import Any

from ..core.exceptions import SpotifyAPIError
from ..core.logging import get_logger, log_error_with_context
from .spotify import spotify_music_client
from .token_refresh_service import TokenRefreshService


class SpotifyDataCollector:
    """Service for collecting music data from Spotify API."""

    def __init__(self, token_service: TokenRefreshService):
        self.token_service = token_service
        self.spotify_client = spotify_music_client
        self.logger = get_logger(__name__)

    async def fetch_user_music_data(self, user_id: int) -> dict[str, Any]:
        """Fetch comprehensive music data from Spotify for analysis."""
        try:
            access_token = await self.token_service.get_valid_access_token(user_id)

            music_data = {}

            # Fetch top tracks and artists for all time ranges
            await self._fetch_top_items(access_token, user_id, music_data)

            # Fetch recently played tracks
            await self._fetch_recently_played(access_token, user_id, music_data)

            # Fetch audio features for all tracks
            await self._fetch_audio_features(access_token, user_id, music_data)

            return music_data

        except Exception as e:
            raise SpotifyAPIError(f"Failed to fetch music data: {e}") from e

    async def _fetch_top_items(
        self, access_token: str, user_id: int, music_data: dict[str, Any]
    ) -> None:
        """Fetch top tracks and artists for all time ranges."""
        for time_range in ["short_term", "medium_term", "long_term"]:
            # Fetch top tracks
            try:
                music_data[
                    f"top_tracks_{time_range}"
                ] = await self.spotify_client.get_user_top_tracks(
                    access_token, time_range, limit=50
                )
            except Exception as e:
                log_error_with_context(
                    self.logger,
                    e,
                    {"time_range": time_range, "endpoint": "top_tracks"},
                    user_id,
                )
                music_data[f"top_tracks_{time_range}"] = {"items": []}

            # Fetch top artists
            try:
                music_data[
                    f"top_artists_{time_range}"
                ] = await self.spotify_client.get_user_top_artists(
                    access_token, time_range, limit=50
                )
            except Exception as e:
                log_error_with_context(
                    self.logger,
                    e,
                    {"time_range": time_range, "endpoint": "top_artists"},
                    user_id,
                )
                music_data[f"top_artists_{time_range}"] = {"items": []}

    async def _fetch_recently_played(
        self, access_token: str, user_id: int, music_data: dict[str, Any]
    ) -> None:
        """Fetch recently played tracks."""
        try:
            music_data[
                "recently_played"
            ] = await self.spotify_client.get_recently_played(access_token, limit=50)
        except Exception as e:
            log_error_with_context(
                self.logger, e, {"endpoint": "recently_played"}, user_id
            )
            music_data["recently_played"] = {"items": []}

    async def _fetch_audio_features(
        self, access_token: str, user_id: int, music_data: dict[str, Any]
    ) -> None:
        """Fetch audio features for all collected tracks."""
        # Extract track IDs from all sources
        track_ids = set()

        # From top tracks
        for time_range in ["short_term", "medium_term", "long_term"]:
            tracks = music_data[f"top_tracks_{time_range}"].get("items", [])
            track_ids.update(track["id"] for track in tracks)

        # From recently played
        recent_tracks = music_data["recently_played"].get("items", [])
        track_ids.update(item["track"]["id"] for item in recent_tracks)

        # Fetch audio features in batches (Spotify API limit is 100)
        track_ids_list = list(track_ids)
        audio_features: list[Any] = []

        if track_ids_list:
            for i in range(0, len(track_ids_list), 100):
                batch = track_ids_list[i : i + 100]
                try:
                    batch_features = await self.spotify_client.get_audio_features(
                        access_token, batch
                    )
                    audio_features.extend(batch_features.get("audio_features", []))
                except Exception as e:
                    log_error_with_context(
                        self.logger,
                        e,
                        {"endpoint": "audio_features", "batch_number": i // 100 + 1},
                        user_id,
                    )
                    # Continue with other batches

        music_data["audio_features"] = audio_features  # type: ignore[assignment]
