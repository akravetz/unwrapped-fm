"""Tests for music analysis endpoints."""

from unittest.mock import patch

import pytest
from httpx import AsyncClient

from src.unwrapped.music.models import MusicAnalysisResult


class TestAnalyzeEndpoints:
    """Test music analysis endpoints."""

    @pytest.mark.asyncio
    async def test_analyze_music_taste_success(
        self, client: AsyncClient, test_user, valid_jwt_token, mock_spotify_client
    ):
        """Test successful music taste analysis."""
        # Mock the spotify client and AI client
        with (
            patch(
                "src.unwrapped.music.spotify_data_collector.spotify_music_client",
                mock_spotify_client,
            ),
            patch(
                "src.unwrapped.music.token_refresh_service.spotify_music_client",
                mock_spotify_client,
            ),
            patch(
                "src.unwrapped.music.analysis_coordinator.MusicAnalysisAI"
            ) as mock_ai_class,
        ):
            # Configure mock AI client to return a test response
            mock_ai_instance = mock_ai_class.return_value

            async def mock_analyze_music_taste(music_data):
                return {
                    "rating_text": "TEST MUSIC TASTE",
                    "rating_description": "This is a test description of your music taste.",
                    "critical_acclaim_score": 0.5,
                    "music_snob_score": 0.2,
                }

            mock_ai_instance.analyze_music_taste = mock_analyze_music_taste

            response = await client.post(
                "/api/v1/music/analyze",
                headers={"Authorization": f"Bearer {valid_jwt_token}"},
            )

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "rating_text" in data
        assert "rating_description" in data
        assert "critical_acclaim_score" in data
        assert "music_snob_score" in data
        assert "share_token" in data
        assert "analyzed_at" in data

        # Verify data types
        assert isinstance(data["rating_text"], str)
        assert isinstance(data["rating_description"], str)
        assert isinstance(data["critical_acclaim_score"], float)
        assert isinstance(data["music_snob_score"], float)

        # Verify axis positions are within valid range
        assert 0.0 <= data["critical_acclaim_score"] <= 1.0
        assert 0.0 <= data["music_snob_score"] <= 1.0

    @pytest.mark.asyncio
    async def test_analyze_music_taste_no_token(self, client: AsyncClient):
        """Test analyze endpoint without authentication token."""
        response = await client.post("/api/v1/music/analyze")
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_analyze_music_taste_invalid_token(self, client: AsyncClient):
        """Test analyze endpoint with invalid authentication token."""
        response = await client.post(
            "/api/v1/music/analyze",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_latest_analysis_no_data(
        self, client: AsyncClient, test_user, valid_jwt_token
    ):
        """Test getting latest analysis when no analysis exists."""
        response = await client.get(
            "/api/v1/music/analysis/latest",
            headers={"Authorization": f"Bearer {valid_jwt_token}"},
        )

        assert response.status_code == 200
        assert response.json() is None

    @pytest.mark.asyncio
    async def test_get_latest_analysis_with_data(
        self, client: AsyncClient, test_user, valid_jwt_token, async_session
    ):
        """Test getting latest analysis when analysis exists."""
        # Create a test analysis result
        from src.unwrapped.music.models import AnalysisStatus

        analysis = MusicAnalysisResult(
            user_id=test_user.id,
            status=AnalysisStatus.COMPLETED,
            rating_text="TEST RATING",
            rating_description="Test description",
            critical_acclaim_score=0.5,
            music_snob_score=0.3,
            share_token="test_share_token",
        )
        async_session.add(analysis)
        await async_session.commit()
        await async_session.refresh(analysis)

        response = await client.get(
            "/api/v1/music/analysis/latest",
            headers={"Authorization": f"Bearer {valid_jwt_token}"},
        )

        assert response.status_code == 200
        data = response.json()

        assert data["rating_text"] == "TEST RATING"
        assert data["rating_description"] == "Test description"
        assert data["critical_acclaim_score"] == 0.5
        assert data["music_snob_score"] == 0.3
        assert data["share_token"] == "test_share_token"
        assert "analyzed_at" in data
