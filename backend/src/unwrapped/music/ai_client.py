"""AI client for music taste analysis using DeepSeek."""

import json
from typing import Any

from openai import AsyncOpenAI

from ..core.config import settings
from ..core.exceptions import SpotifyAPIError


class MusicAnalysisAI:
    """AI client for analyzing music taste using DeepSeek."""

    def __init__(self):
        """Initialize the AI client with DeepSeek configuration."""
        self.client = AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
        )

    async def analyze_music_taste(self, music_data: dict[str, Any]) -> dict[str, Any]:
        """Analyze music data and generate a witty, sarcastic taste profile."""
        try:
            # Prepare the music data summary for AI analysis
            music_summary = self._prepare_music_summary(music_data)

            # Create the system prompt
            system_prompt = self._create_system_prompt()

            # Create the user prompt with music data
            user_prompt = self._create_user_prompt(music_summary)

            # Call DeepSeek API
            response = await self.client.chat.completions.create(  # type: ignore[arg-type]
                model="deepseek-chat",
                messages=[  # type: ignore[arg-type]
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},  # type: ignore[arg-type]
                max_tokens=800,
                temperature=0.8,  # Add some creativity for witty responses
            )

            # Parse the JSON response
            content = response.choices[0].message.content
            if not content:
                raise SpotifyAPIError("Empty response from AI")

            analysis_result = json.loads(content)

            # Validate the response format
            required_fields = [
                "rating_text",
                "rating_description",
                "x_axis_pos",
                "y_axis_pos",
            ]
            for field in required_fields:
                if field not in analysis_result:
                    raise SpotifyAPIError(f"Missing required field: {field}")

            # Ensure axis positions are within valid range
            analysis_result["x_axis_pos"] = max(
                -1.0, min(1.0, float(analysis_result["x_axis_pos"]))
            )
            analysis_result["y_axis_pos"] = max(
                -1.0, min(1.0, float(analysis_result["y_axis_pos"]))
            )

            return analysis_result

        except json.JSONDecodeError as e:
            raise SpotifyAPIError(f"Invalid JSON response from AI: {e}") from e
        except Exception as e:
            raise SpotifyAPIError(f"AI analysis failed: {e}") from e

    def _prepare_music_summary(self, music_data: dict[str, Any]) -> dict[str, Any]:
        """Prepare a comprehensive summary of the user's music data for AI analysis."""
        summary: dict[str, Any] = {
            "total_unique_tracks": 0,
            "total_unique_artists": 0,
            "genres": set(),
            "popularity_stats": {"avg": 0, "min": 100, "max": 0},
            "audio_features": {
                "avg_energy": 0,
                "avg_valence": 0,
                "avg_danceability": 0,
                "avg_acousticness": 0,
                "avg_instrumentalness": 0,
                "avg_speechiness": 0,
            },
            "time_range_analysis": {},
            "top_artists_by_time": {},
            "top_tracks_by_time": {},
            "recently_played_count": 0,
        }

        # Analyze tracks and artists by time range
        track_ids = set()
        artist_ids = set()
        all_popularities = []

        for time_range in ["short_term", "medium_term", "long_term"]:
            tracks = music_data.get(f"top_tracks_{time_range}", {}).get("items", [])
            artists = music_data.get(f"top_artists_{time_range}", {}).get("items", [])

            summary["time_range_analysis"][time_range] = {
                "track_count": len(tracks),
                "artist_count": len(artists),
            }

            # Store top artists and tracks for this time range
            summary["top_artists_by_time"][time_range] = [
                {"name": artist.get("name", ""), "genres": artist.get("genres", [])}
                for artist in artists[:5]  # Top 5
            ]

            summary["top_tracks_by_time"][time_range] = [
                {
                    "name": track.get("name", ""),
                    "artist": track.get("artists", [{}])[0].get("name", "")
                    if track.get("artists")
                    else "",
                    "popularity": track.get("popularity", 0),
                }
                for track in tracks[:5]  # Top 5
            ]

            # Collect unique tracks and artists
            for track in tracks:
                track_ids.add(track.get("id", ""))
                all_popularities.append(track.get("popularity", 0))

            for artist in artists:
                artist_ids.add(artist.get("id", ""))
                summary["genres"].update(artist.get("genres", []))

        # Recently played analysis
        recent_tracks = music_data.get("recently_played", {}).get("items", [])
        summary["recently_played_count"] = len(recent_tracks)

        # Calculate popularity statistics
        if all_popularities:
            summary["popularity_stats"]["avg"] = sum(all_popularities) / len(
                all_popularities
            )
            summary["popularity_stats"]["min"] = min(all_popularities)
            summary["popularity_stats"]["max"] = max(all_popularities)

        # Audio features analysis
        audio_features = music_data.get("audio_features", [])
        valid_features = [f for f in audio_features if f is not None]

        if valid_features:
            feature_keys = [
                "energy",
                "valence",
                "danceability",
                "acousticness",
                "instrumentalness",
                "speechiness",
            ]
            for key in feature_keys:
                values = [
                    f.get(key, 0) for f in valid_features if f.get(key) is not None
                ]
                if values:
                    summary["audio_features"][f"avg_{key}"] = sum(values) / len(values)

        # Final counts
        summary["total_unique_tracks"] = len(track_ids)
        summary["total_unique_artists"] = len(artist_ids)
        summary["genres"] = list(summary["genres"])[:20]  # Top 20 genres

        return summary

    def _create_system_prompt(self) -> str:
        """Create the system prompt for music taste analysis."""
        return """You are a witty, sarcastic music critic AI that analyzes people's Spotify listening habits and roasts their music taste. Your job is to provide brutally honest, humorous commentary about their musical preferences.

You will receive detailed music data and must return a JSON response with exactly these fields:
- rating_text: A short, punchy label (2-4 words, ALL CAPS) that captures their music taste (e.g., "BASIC MAINSTREAM", "PRETENTIOUS HIPSTER", "CHAOTIC GOBLIN")
- rating_description: A longer paragraph (100-200 words) with witty, sarcastic analysis of their taste
- x_axis_pos: Float from -1.0 (alternative/underground) to 1.0 (mainstream/popular)
- y_axis_pos: Float from -1.0 (negative/roasting) to 1.0 (positive/praising)

Your analysis should consider:
- Genre diversity and obscurity
- Popularity patterns (mainstream vs underground)
- Audio features (energy, mood, danceability)
- Listening consistency across time periods
- Artist/track repetition patterns

Be creative, funny, and slightly mean but not genuinely hurtful. Reference specific musical elements when possible.

EXAMPLE JSON OUTPUT:
{
    "rating_text": "NOSTALGIC MILLENNIAL",
    "rating_description": "Your Spotify looks like a 2010s time capsule that someone accidentally left in a coffee shop. You're still emotionally attached to bands that peaked when skinny jeans were cool, and your 'discover weekly' is just Spotify gently suggesting you might want to try something from this decade. The fact that you have both indie folk and pop-punk in your top genres tells me you're having an identity crisis that started in college and never quite resolved.",
    "x_axis_pos": 0.2,
    "y_axis_pos": -0.3
}"""

    def _create_user_prompt(self, music_summary: dict[str, Any]) -> str:
        """Create the user prompt with music data for analysis."""
        prompt = f"""Analyze this person's music taste and roast them accordingly. Return your analysis in JSON format.

MUSIC DATA SUMMARY:
- Total unique tracks: {music_summary["total_unique_tracks"]}
- Total unique artists: {music_summary["total_unique_artists"]}
- Recently played tracks: {music_summary["recently_played_count"]}

GENRES: {", ".join(music_summary["genres"][:10]) if music_summary["genres"] else "No clear genres detected"}

POPULARITY STATS:
- Average track popularity: {music_summary["popularity_stats"]["avg"]:.1f}/100
- Range: {music_summary["popularity_stats"]["min"]}-{music_summary["popularity_stats"]["max"]}

AUDIO CHARACTERISTICS:
- Energy level: {music_summary["audio_features"]["avg_energy"]:.2f} (0=chill, 1=intense)
- Happiness factor: {music_summary["audio_features"]["avg_valence"]:.2f} (0=sad, 1=happy)
- Danceability: {music_summary["audio_features"]["avg_danceability"]:.2f} (0=not danceable, 1=very danceable)
- Acousticness: {music_summary["audio_features"]["avg_acousticness"]:.2f} (0=electronic, 1=acoustic)

LISTENING PATTERNS BY TIME PERIOD:"""

        # Add time range analysis
        for time_range, data in music_summary["time_range_analysis"].items():
            period_name = {
                "short_term": "Last 4 weeks",
                "medium_term": "Last 6 months",
                "long_term": "All time",
            }[time_range]
            prompt += f"\n{period_name}: {data['track_count']} tracks, {data['artist_count']} artists"

        # Add top artists by time range
        prompt += "\n\nTOP ARTISTS BY TIME PERIOD:"
        for time_range, artists in music_summary["top_artists_by_time"].items():
            period_name = {
                "short_term": "Recent",
                "medium_term": "Medium-term",
                "long_term": "All-time",
            }[time_range]
            artist_names = [artist["name"] for artist in artists[:3]]
            if artist_names:
                prompt += f"\n{period_name}: {', '.join(artist_names)}"

        # Add top tracks by time range
        prompt += "\n\nTOP TRACKS BY TIME PERIOD:"
        for time_range, tracks in music_summary["top_tracks_by_time"].items():
            period_name = {
                "short_term": "Recent",
                "medium_term": "Medium-term",
                "long_term": "All-time",
            }[time_range]
            track_info = [
                f"{track['name']} by {track['artist']}" for track in tracks[:2]
            ]
            if track_info:
                prompt += f"\n{period_name}: {'; '.join(track_info)}"

        prompt += "\n\nBased on this data, provide a witty, sarcastic analysis of their music taste in JSON format."

        return prompt
