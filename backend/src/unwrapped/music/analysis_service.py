"""Music analysis service for AI-powered music taste analysis."""

from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from ..auth.service import UserService
from ..core.exceptions import SpotifyAPIError
from .models import MusicAnalysisResponse, MusicAnalysisResult
from .spotify import spotify_music_client


class MusicAnalysisService:
    """Service for analyzing user's music taste with AI."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.spotify_client = spotify_music_client

    async def _get_valid_access_token(self, user_id: int) -> str:
        """Get valid access token, refreshing if necessary."""
        user_service = UserService(self.session)
        user = await user_service.get_user_by_id(user_id)
        if not user:
            raise SpotifyAPIError(f"User {user_id} not found")

        if not user.access_token:
            raise SpotifyAPIError("User has no Spotify access token")

        # Check if token expires soon (within 5 minutes)
        if user.token_expires_at:
            expires_soon = datetime.now(UTC) + timedelta(minutes=5)
            if user.token_expires_at <= expires_soon:
                # Token expired or expires soon, refresh it
                if not user.refresh_token:
                    raise SpotifyAPIError("Spotify refresh token not available")

                try:
                    # Refresh the token
                    token_info = await self.spotify_client.refresh_access_token(
                        user.refresh_token
                    )

                    # Update user with new token info
                    user.access_token = token_info.access_token
                    user.refresh_token = token_info.refresh_token
                    user.token_expires_at = datetime.now(UTC) + timedelta(
                        seconds=token_info.expires_in
                    )

                    # Save updated user
                    self.session.add(user)
                    await self.session.commit()
                    await self.session.refresh(user)

                    return token_info.access_token

                except Exception as e:
                    raise SpotifyAPIError(
                        f"Failed to refresh Spotify token: {e}"
                    ) from e

        return user.access_token

    async def _fetch_user_music_data(self, user_id: int) -> dict[str, Any]:
        """Fetch comprehensive music data from Spotify for analysis."""
        try:
            access_token = await self._get_valid_access_token(user_id)

            music_data = {}

            # Fetch top tracks for all time ranges
            for time_range in ["short_term", "medium_term", "long_term"]:
                music_data[
                    f"top_tracks_{time_range}"
                ] = await self.spotify_client.get_user_top_tracks(
                    access_token, time_range, limit=50
                )
                music_data[
                    f"top_artists_{time_range}"
                ] = await self.spotify_client.get_user_top_artists(
                    access_token, time_range, limit=50
                )

            # Fetch recently played tracks
            music_data[
                "recently_played"
            ] = await self.spotify_client.get_recently_played(access_token, limit=50)

            # Extract track IDs for audio features
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
            audio_features = []

            for i in range(0, len(track_ids_list), 100):
                batch = track_ids_list[i : i + 100]
                batch_features = await self.spotify_client.get_audio_features(
                    access_token, batch
                )
                audio_features.extend(batch_features.get("audio_features", []))

            music_data["audio_features"] = audio_features

            return music_data

        except Exception as e:
            raise SpotifyAPIError(f"Failed to fetch music data: {e}") from e

    async def _analyze_music_with_ai(
        self, music_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Analyze music data with AI to generate taste profile."""
        # TODO: Implement actual AI analysis
        # For now, return mock analysis based on music data patterns

        # Extract some basic stats for mock analysis
        total_tracks = 0
        genres = set()
        avg_popularity = 0

        # Count tracks and extract genres from top artists
        for time_range in ["short_term", "medium_term", "long_term"]:
            tracks = music_data.get(f"top_tracks_{time_range}", {}).get("items", [])
            total_tracks += len(tracks)

            artists = music_data.get(f"top_artists_{time_range}", {}).get("items", [])
            for artist in artists:
                genres.update(artist.get("genres", []))

        # Calculate average popularity from tracks
        all_popularities = []
        for time_range in ["short_term", "medium_term", "long_term"]:
            tracks = music_data.get(f"top_tracks_{time_range}", {}).get("items", [])
            all_popularities.extend(track.get("popularity", 0) for track in tracks)

        if all_popularities:
            avg_popularity = sum(all_popularities) / len(all_popularities)

        # Analyze audio features
        audio_features = music_data.get("audio_features", [])
        avg_energy = 0
        avg_valence = 0
        avg_danceability = 0

        if audio_features:
            valid_features = [f for f in audio_features if f is not None]
            if valid_features:
                avg_energy = sum(f.get("energy", 0) for f in valid_features) / len(
                    valid_features
                )
                avg_valence = sum(f.get("valence", 0) for f in valid_features) / len(
                    valid_features
                )
                avg_danceability = sum(
                    f.get("danceability", 0) for f in valid_features
                ) / len(valid_features)

        # Mock AI analysis logic
        if avg_popularity > 70:
            if "pop" in genres or "mainstream" in str(genres).lower():
                rating_text = "BASIC MAINSTREAM"
                x_pos = 0.7  # Mainstream
                y_pos = -0.3  # Slightly negative
            else:
                rating_text = "POPULAR TASTE"
                x_pos = 0.5
                y_pos = 0.2
        elif avg_popularity < 30:
            if any(
                genre in ["experimental", "noise", "avant-garde"] for genre in genres
            ):
                rating_text = "PRETENTIOUS HIPSTER"
                x_pos = -0.8  # Very alternative
                y_pos = -0.6  # Negative
            else:
                rating_text = "UNDERGROUND EXPLORER"
                x_pos = -0.5
                y_pos = 0.4
        else:
            if avg_energy > 0.7 and avg_danceability > 0.7:
                rating_text = "PARTY ANIMAL"
                x_pos = 0.3
                y_pos = 0.8
            elif avg_valence < 0.3:
                rating_text = "EMO SADBOY"
                x_pos = -0.2
                y_pos = -0.7
            else:
                rating_text = "BALANCED LISTENER"
                x_pos = 0.0
                y_pos = 0.1

        # Generate description
        genre_list = list(genres)[:5]  # Top 5 genres
        description = f"Your music taste spans {len(genre_list)} genres including {', '.join(genre_list[:3])}. "
        description += f"With an average track popularity of {avg_popularity:.0f}, "
        description += f"energy level of {avg_energy:.1f}, and happiness factor of {avg_valence:.1f}, "
        description += f"you clearly have {rating_text.lower()} vibes."

        return {
            "rating_text": rating_text,
            "rating_description": description,
            "x_axis_pos": x_pos,
            "y_axis_pos": y_pos,
        }

    async def analyze_user_music_taste(self, user_id: int) -> MusicAnalysisResponse:
        """Analyze user's music taste and return AI verdict."""
        try:
            # Fetch music data from Spotify
            music_data = await self._fetch_user_music_data(user_id)

            # Analyze with AI
            analysis_result = await self._analyze_music_with_ai(music_data)

            # Store result in database
            db_result = MusicAnalysisResult(
                user_id=user_id,
                rating_text=analysis_result["rating_text"],
                rating_description=analysis_result["rating_description"],
                x_axis_pos=analysis_result["x_axis_pos"],
                y_axis_pos=analysis_result["y_axis_pos"],
            )

            self.session.add(db_result)
            await self.session.commit()
            await self.session.refresh(db_result)

            # Return response
            return MusicAnalysisResponse(
                rating_text=db_result.rating_text,
                rating_description=db_result.rating_description,
                x_axis_pos=db_result.x_axis_pos,
                y_axis_pos=db_result.y_axis_pos,
                analyzed_at=db_result.created_at,
            )

        except Exception as e:
            raise SpotifyAPIError(f"Failed to analyze music taste: {e}") from e

    async def get_latest_analysis(self, user_id: int) -> MusicAnalysisResponse | None:
        """Get the user's most recent music analysis."""
        try:
            stmt = (
                select(MusicAnalysisResult)
                .where(MusicAnalysisResult.user_id == user_id)
                .order_by(MusicAnalysisResult.created_at.desc())
                .limit(1)
            )

            result = await self.session.execute(stmt)
            analysis = result.scalar_one_or_none()

            if not analysis:
                return None

            return MusicAnalysisResponse(
                rating_text=analysis.rating_text,
                rating_description=analysis.rating_description,
                x_axis_pos=analysis.x_axis_pos,
                y_axis_pos=analysis.y_axis_pos,
                analyzed_at=analysis.created_at,
            )

        except Exception as e:
            raise SpotifyAPIError(f"Failed to get latest analysis: {e}") from e
