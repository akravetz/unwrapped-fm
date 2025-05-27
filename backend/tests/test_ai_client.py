"""Tests for AI music analysis client."""

import json
from unittest.mock import AsyncMock, patch

import pytest

from src.unwrapped.core.exceptions import SpotifyAPIError
from src.unwrapped.music.ai_client import MusicAnalysisAI


class TestMusicAnalysisAI:
    """Test AI music analysis client."""

    @pytest.fixture
    def ai_client(self):
        """Create AI client for testing."""
        return MusicAnalysisAI()

    @pytest.fixture
    def sample_music_data(self):
        """Sample music data for testing."""
        return {
            "top_tracks_short_term": {
                "items": [
                    {
                        "id": "track1",
                        "name": "Test Track 1",
                        "popularity": 75,
                        "artists": [{"name": "Test Artist 1"}],
                    },
                    {
                        "id": "track2",
                        "name": "Test Track 2",
                        "popularity": 60,
                        "artists": [{"name": "Test Artist 2"}],
                    },
                ]
            },
            "top_tracks_medium_term": {"items": []},
            "top_tracks_long_term": {"items": []},
            "top_artists_short_term": {
                "items": [
                    {
                        "id": "artist1",
                        "name": "Test Artist 1",
                        "genres": ["pop", "indie"],
                    }
                ]
            },
            "top_artists_medium_term": {"items": []},
            "top_artists_long_term": {"items": []},
            "recently_played": {"items": []},
        }

    @pytest.mark.asyncio
    async def test_analyze_music_taste_success(self, ai_client, sample_music_data):
        """Test successful AI analysis."""
        # Mock the OpenAI client response
        mock_response = {
            "rating_text": "TEST RATING",
            "rating_description": "This is a test description of music taste.",
            "critical_acclaim_score": 0.5,
            "music_snob_score": 0.3,
        }

        mock_completion = AsyncMock()
        mock_completion.choices = [AsyncMock()]
        mock_completion.choices[0].message.content = json.dumps(mock_response)

        with patch.object(
            ai_client.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_completion,
        ):
            result = await ai_client.analyze_music_taste(sample_music_data)

        assert result["rating_text"] == "TEST RATING"
        assert (
            result["rating_description"] == "This is a test description of music taste."
        )
        assert result["critical_acclaim_score"] == 0.5
        assert result["music_snob_score"] == 0.3

    @pytest.mark.asyncio
    async def test_analyze_music_taste_empty_response(
        self, ai_client, sample_music_data
    ):
        """Test handling of empty AI response."""
        mock_completion = AsyncMock()
        mock_completion.choices = [AsyncMock()]
        mock_completion.choices[0].message.content = None

        with patch.object(
            ai_client.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_completion,
        ):
            with pytest.raises(SpotifyAPIError, match="Empty response from AI"):
                await ai_client.analyze_music_taste(sample_music_data)

    @pytest.mark.asyncio
    async def test_analyze_music_taste_invalid_json(self, ai_client, sample_music_data):
        """Test handling of invalid JSON response."""
        mock_completion = AsyncMock()
        mock_completion.choices = [AsyncMock()]
        mock_completion.choices[0].message.content = "invalid json"

        with patch.object(
            ai_client.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_completion,
        ):
            with pytest.raises(SpotifyAPIError, match="Invalid JSON response from AI"):
                await ai_client.analyze_music_taste(sample_music_data)

    @pytest.mark.asyncio
    async def test_analyze_music_taste_missing_fields(
        self, ai_client, sample_music_data
    ):
        """Test handling of response missing required fields."""
        mock_response = {
            "rating_text": "TEST RATING",
            # Missing other required fields
        }

        mock_completion = AsyncMock()
        mock_completion.choices = [AsyncMock()]
        mock_completion.choices[0].message.content = json.dumps(mock_response)

        with patch.object(
            ai_client.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_completion,
        ):
            with pytest.raises(SpotifyAPIError, match="Missing required field"):
                await ai_client.analyze_music_taste(sample_music_data)

    @pytest.mark.asyncio
    async def test_analyze_music_taste_axis_clamping(
        self, ai_client, sample_music_data
    ):
        """Test that axis positions are clamped to valid range."""
        mock_response = {
            "rating_text": "TEST RATING",
            "rating_description": "Test description",
            "critical_acclaim_score": 2.0,  # Out of range
            "music_snob_score": -2.0,  # Out of range
        }

        mock_completion = AsyncMock()
        mock_completion.choices = [AsyncMock()]
        mock_completion.choices[0].message.content = json.dumps(mock_response)

        with patch.object(
            ai_client.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_completion,
        ):
            result = await ai_client.analyze_music_taste(sample_music_data)

        # Values should be clamped to [-1.0, 1.0]
        assert result["critical_acclaim_score"] == 1.0
        assert result["music_snob_score"] == -1.0

    def test_prepare_music_summary(self, ai_client, sample_music_data):
        """Test music data summary preparation."""
        summary = ai_client._prepare_music_summary(sample_music_data)

        assert summary["total_unique_tracks"] == 2
        assert summary["total_unique_artists"] == 1
        assert "pop" in summary["genres"]
        assert "indie" in summary["genres"]
        assert summary["popularity_stats"]["avg"] == 67.5  # (75 + 60) / 2
        assert summary["genre_diversity"] == 2  # pop and indie
        assert summary["mainstream_score"] == 0.675  # 67.5 / 100
        assert summary["recently_played_count"] == 0

    def test_prepare_music_summary_empty_data(self, ai_client):
        """Test music data summary with empty data."""
        empty_data = {
            "top_tracks_short_term": {"items": []},
            "top_tracks_medium_term": {"items": []},
            "top_tracks_long_term": {"items": []},
            "top_artists_short_term": {"items": []},
            "top_artists_medium_term": {"items": []},
            "top_artists_long_term": {"items": []},
            "recently_played": {"items": []},
        }

        summary = ai_client._prepare_music_summary(empty_data)

        assert summary["total_unique_tracks"] == 0
        assert summary["total_unique_artists"] == 0
        assert summary["genres"] == []
        assert summary["popularity_stats"]["avg"] == 0

    def test_create_system_prompt(self, ai_client):
        """Test system prompt creation."""
        prompt = ai_client._create_system_prompt()

        assert "witty, sarcastic music critic" in prompt
        assert "JSON response" in prompt
        assert "rating_text" in prompt
        assert "rating_description" in prompt
        assert "critical_acclaim_score" in prompt
        assert "music_snob_score" in prompt

    def test_create_user_prompt(self, ai_client, sample_music_data):
        """Test user prompt creation with music data."""
        summary = ai_client._prepare_music_summary(sample_music_data)
        prompt = ai_client._create_user_prompt(summary)

        assert "Total unique tracks: 2" in prompt
        assert "Total unique artists: 1" in prompt
        assert "pop, indie" in prompt or "indie, pop" in prompt
        assert "Average track popularity: 67.5" in prompt
        assert "Genre diversity: 2" in prompt
        assert "Mainstream score: 0.68" in prompt
        assert "JSON format" in prompt
