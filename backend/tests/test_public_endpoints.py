"""Tests for public endpoints (no authentication required)."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.unwrapped.music.models import AnalysisStatus, MusicAnalysisResult


class TestPublicEndpoints:
    """Test public endpoints that don't require authentication."""

    @pytest.mark.asyncio
    async def test_get_shared_analysis_success(
        self, client: AsyncClient, test_user, async_session: AsyncSession
    ):
        """Test successful retrieval of shared analysis."""
        # Create a completed analysis with share token
        analysis = MusicAnalysisResult(
            user_id=test_user.id,
            status=AnalysisStatus.COMPLETED,
            rating_text="INDIE DARLING",
            rating_description="Your music taste is sophisticated and refined.",
            critical_acclaim_score=0.8,
            music_snob_score=0.6,
            share_token="test_share_token_123",
        )
        async_session.add(analysis)
        await async_session.commit()

        # Test the public endpoint
        response = await client.get("/api/v1/public/share/test_share_token_123")

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert data["rating_text"] == "INDIE DARLING"
        assert (
            data["rating_description"]
            == "Your music taste is sophisticated and refined."
        )
        assert data["critical_acclaim_score"] == 0.8
        assert data["music_snob_score"] == 0.6
        assert "analyzed_at" in data

        # Verify sensitive data is not included
        assert "share_token" not in data
        assert "user_id" not in data

    @pytest.mark.asyncio
    async def test_get_shared_analysis_not_found(self, client: AsyncClient):
        """Test retrieval with invalid share token."""
        response = await client.get("/api/v1/public/share/invalid_token")

        assert response.status_code == 404
        assert response.json()["detail"] == "Analysis not found"

    @pytest.mark.asyncio
    async def test_get_shared_analysis_incomplete(
        self, client: AsyncClient, test_user, async_session: AsyncSession
    ):
        """Test retrieval of incomplete analysis returns 404."""
        # Create a pending analysis
        analysis = MusicAnalysisResult(
            user_id=test_user.id,
            status=AnalysisStatus.PENDING,
            share_token="pending_token_123",
        )
        async_session.add(analysis)
        await async_session.commit()

        # Test the public endpoint
        response = await client.get("/api/v1/public/share/pending_token_123")

        assert response.status_code == 404
        assert response.json()["detail"] == "Analysis not found"

    @pytest.mark.asyncio
    async def test_get_shared_analysis_missing_data(
        self, client: AsyncClient, test_user, async_session: AsyncSession
    ):
        """Test retrieval of analysis with missing required data returns 404."""
        # Create a completed analysis but missing required fields
        analysis = MusicAnalysisResult(
            user_id=test_user.id,
            status=AnalysisStatus.COMPLETED,
            rating_text="INCOMPLETE",
            # Missing rating_description, scores
            share_token="incomplete_token_123",
        )
        async_session.add(analysis)
        await async_session.commit()

        # Test the public endpoint
        response = await client.get("/api/v1/public/share/incomplete_token_123")

        assert response.status_code == 404
        assert response.json()["detail"] == "Analysis not found"
