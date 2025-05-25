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
        # Mock the spotify client in the analysis service
        with patch(
            "src.unwrapped.music.analysis_service.spotify_music_client",
            mock_spotify_client,
        ):
            response = await client.post(
                "/api/v1/music/analyze",
                headers={"Authorization": f"Bearer {valid_jwt_token}"},
            )

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "rating_text" in data
        assert "rating_description" in data
        assert "x_axis_pos" in data
        assert "y_axis_pos" in data
        assert "share_token" in data
        assert "analyzed_at" in data

        # Verify data types
        assert isinstance(data["rating_text"], str)
        assert isinstance(data["rating_description"], str)
        assert isinstance(data["x_axis_pos"], float)
        assert isinstance(data["y_axis_pos"], float)

        # Verify axis positions are within valid range
        assert -1.0 <= data["x_axis_pos"] <= 1.0
        assert -1.0 <= data["y_axis_pos"] <= 1.0

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
        analysis = MusicAnalysisResult(
            user_id=test_user.id,
            rating_text="TEST RATING",
            rating_description="Test description",
            x_axis_pos=0.5,
            y_axis_pos=-0.3,
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
        assert data["x_axis_pos"] == 0.5
        assert data["y_axis_pos"] == -0.3
        assert data["share_token"] == "test_share_token"
        assert "analyzed_at" in data
