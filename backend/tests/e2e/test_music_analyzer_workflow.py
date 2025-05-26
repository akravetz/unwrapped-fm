"""End-to-end tests for the complete music analyzer workflow."""

import asyncio
from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.unwrapped.auth.models import User
from src.unwrapped.music.models import AnalysisStatus


class TestMusicAnalyzerWorkflow:
    """End-to-end tests for the complete music analyzer workflow."""

    @pytest.mark.asyncio
    async def test_complete_music_analysis_workflow(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        sample_user_data: dict,
        mock_spotify_client: AsyncMock,
    ):
        """Test the complete music analysis workflow from begin to completion."""

        # Create test user within the test to avoid greenlet issues
        from src.unwrapped.auth.models import UserCreate
        from src.unwrapped.core.security import create_user_token

        user_create = UserCreate(**sample_user_data)
        test_user = User(**user_create.model_dump())
        test_user.access_token = "test_access_token"
        test_user.refresh_token = "test_refresh_token"

        async_session.add(test_user)
        await async_session.commit()
        await async_session.refresh(test_user)

        # Create JWT token for this user
        valid_jwt_token = create_user_token(test_user.id)

        # Mock the spotify client and AI client for the background task
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
                "src.unwrapped.music.background_tasks.MusicAnalysisAI"
            ) as mock_ai_class,
        ):
            # Configure mock AI client
            mock_ai_instance = mock_ai_class.return_value
            mock_ai_instance.analyze_music_taste = AsyncMock(
                return_value={
                    "rating_text": "E2E TEST MUSIC TASTE",
                    "rating_description": "This is an end-to-end test description of your music taste.",
                    "x_axis_pos": 0.7,
                    "y_axis_pos": -0.3,
                }
            )

            # Step 1: Begin analysis
            begin_response = await client.post(
                "/api/v1/music/analysis/begin",
                headers={"Authorization": f"Bearer {valid_jwt_token}"},
            )

            assert begin_response.status_code == 200
            begin_data = begin_response.json()

            # Verify begin response structure
            assert "analysis_id" in begin_data
            assert "status" in begin_data
            assert begin_data["status"] == AnalysisStatus.PENDING

            analysis_id = begin_data["analysis_id"]

            # Step 2: Poll status until completion (with timeout)
            max_polls = 20  # Maximum number of polls to prevent infinite loop
            poll_count = 0
            status = AnalysisStatus.PENDING

            while (
                status not in [AnalysisStatus.COMPLETED, AnalysisStatus.FAILED]
                and poll_count < max_polls
            ):
                # Small delay to allow background task to process
                await asyncio.sleep(0.1)

                status_response = await client.get(
                    "/api/v1/music/analysis/status",
                    headers={"Authorization": f"Bearer {valid_jwt_token}"},
                )

                assert status_response.status_code == 200
                status_data = status_response.json()

                # Verify status response structure
                assert "analysis_id" in status_data
                assert "status" in status_data
                assert "created_at" in status_data
                assert status_data["analysis_id"] == analysis_id

                status = status_data["status"]
                poll_count += 1

            # Verify we didn't timeout
            assert poll_count < max_polls, (
                "Analysis did not complete within expected time"
            )
            assert status == AnalysisStatus.COMPLETED, (
                f"Analysis failed with status: {status}"
            )

            # Step 3: Get completed analysis results
            result_response = await client.get(
                "/api/v1/music/analysis/result",
                headers={"Authorization": f"Bearer {valid_jwt_token}"},
            )

            assert result_response.status_code == 200
            result_data = result_response.json()

            # Verify result structure and content
            assert "rating_text" in result_data
            assert "rating_description" in result_data
            assert "x_axis_pos" in result_data
            assert "y_axis_pos" in result_data
            assert "share_token" in result_data
            assert "analyzed_at" in result_data

            # Verify specific test data
            assert result_data["rating_text"] == "E2E TEST MUSIC TASTE"
            assert (
                result_data["rating_description"]
                == "This is an end-to-end test description of your music taste."
            )
            assert result_data["x_axis_pos"] == 0.7
            assert result_data["y_axis_pos"] == -0.3

            # Verify data types
            assert isinstance(result_data["rating_text"], str)
            assert isinstance(result_data["rating_description"], str)
            assert isinstance(result_data["x_axis_pos"], float)
            assert isinstance(result_data["y_axis_pos"], float)
            assert isinstance(result_data["share_token"], str)

            # Verify axis positions are within valid range
            assert -1.0 <= result_data["x_axis_pos"] <= 1.0
            assert -1.0 <= result_data["y_axis_pos"] <= 1.0

            # Step 4: Verify the workflow completed successfully
            # The API responses above already verify the data integrity
            # Additional verification: ensure we can call the endpoints again

            # Verify status endpoint still works after completion
            final_status_response = await client.get(
                "/api/v1/music/analysis/status",
                headers={"Authorization": f"Bearer {valid_jwt_token}"},
            )
            assert final_status_response.status_code == 200
            final_status_data = final_status_response.json()
            assert final_status_data["status"] == AnalysisStatus.COMPLETED

            # Verify result endpoint is consistent
            second_result_response = await client.get(
                "/api/v1/music/analysis/result",
                headers={"Authorization": f"Bearer {valid_jwt_token}"},
            )
            assert second_result_response.status_code == 200
            second_result_data = second_result_response.json()

            # Results should be identical
            assert second_result_data["rating_text"] == result_data["rating_text"]
            assert second_result_data["share_token"] == result_data["share_token"]

    @pytest.mark.asyncio
    async def test_idempotent_begin_analysis(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        sample_user_data: dict,
        mock_spotify_client: AsyncMock,
    ):
        """Test that calling begin analysis multiple times returns the same analysis."""

        # Create test user within the test to avoid greenlet issues
        from src.unwrapped.auth.models import UserCreate
        from src.unwrapped.core.security import create_user_token

        user_create = UserCreate(**sample_user_data)
        test_user = User(**user_create.model_dump())
        test_user.access_token = "test_access_token"
        test_user.refresh_token = "test_refresh_token"

        async_session.add(test_user)
        await async_session.commit()
        await async_session.refresh(test_user)

        # Create JWT token for this user
        valid_jwt_token = create_user_token(test_user.id)

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
                "src.unwrapped.music.background_tasks.MusicAnalysisAI"
            ) as mock_ai_class,
        ):
            mock_ai_instance = mock_ai_class.return_value
            mock_ai_instance.analyze_music_taste = AsyncMock(
                return_value={
                    "rating_text": "IDEMPOTENT TEST",
                    "rating_description": "Test description",
                    "x_axis_pos": 0.5,
                    "y_axis_pos": 0.5,
                }
            )

            # First call to begin analysis
            first_response = await client.post(
                "/api/v1/music/analysis/begin",
                headers={"Authorization": f"Bearer {valid_jwt_token}"},
            )

            assert first_response.status_code == 200
            first_data = first_response.json()
            first_analysis_id = first_data["analysis_id"]

            # Second call to begin analysis (should return same analysis)
            second_response = await client.post(
                "/api/v1/music/analysis/begin",
                headers={"Authorization": f"Bearer {valid_jwt_token}"},
            )

            assert second_response.status_code == 200
            second_data = second_response.json()
            second_analysis_id = second_data["analysis_id"]

            # Should return the same analysis ID
            assert first_analysis_id == second_analysis_id

            # Third call after some processing time
            await asyncio.sleep(0.1)

            third_response = await client.post(
                "/api/v1/music/analysis/begin",
                headers={"Authorization": f"Bearer {valid_jwt_token}"},
            )

            assert third_response.status_code == 200
            third_data = third_response.json()
            third_analysis_id = third_data["analysis_id"]

            # Should still return the same analysis ID
            assert first_analysis_id == third_analysis_id

    @pytest.mark.asyncio
    async def test_analysis_error_handling(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        sample_user_data: dict,
        mock_spotify_client: AsyncMock,
    ):
        """Test error handling when analysis fails completely."""

        # Create test user within the test to avoid greenlet issues
        from src.unwrapped.auth.models import UserCreate
        from src.unwrapped.core.security import create_user_token

        user_create = UserCreate(**sample_user_data)
        test_user = User(**user_create.model_dump())
        test_user.access_token = "test_access_token"
        test_user.refresh_token = "test_refresh_token"

        async_session.add(test_user)
        await async_session.commit()
        await async_session.refresh(test_user)

        # Create JWT token for this user
        valid_jwt_token = create_user_token(test_user.id)

        # Configure spotify client to raise an error
        mock_spotify_client.get_user_top_tracks.side_effect = Exception(
            "Spotify API Error"
        )

        with (
            patch(
                "src.unwrapped.music.spotify_data_collector.spotify_music_client",
                mock_spotify_client,
            ),
            patch(
                "src.unwrapped.music.token_refresh_service.spotify_music_client",
                mock_spotify_client,
            ),
            # Also make the AI client fail to force a complete failure
            patch(
                "src.unwrapped.music.background_tasks.MusicAnalysisAI"
            ) as mock_ai_class,
            # Make the share token generation fail to force a complete failure
            patch(
                "src.unwrapped.music.background_tasks.generate_unique_share_token",
                side_effect=Exception("Database error during share token generation"),
            ),
        ):
            mock_ai_instance = mock_ai_class.return_value
            mock_ai_instance.analyze_music_taste = AsyncMock(
                side_effect=Exception("AI service unavailable")
            )

            # Begin analysis
            begin_response = await client.post(
                "/api/v1/music/analysis/begin",
                headers={"Authorization": f"Bearer {valid_jwt_token}"},
            )

            assert begin_response.status_code == 200

            # Poll status until failure (with timeout)
            max_polls = 20
            poll_count = 0
            status = AnalysisStatus.PENDING

            while (
                status not in [AnalysisStatus.COMPLETED, AnalysisStatus.FAILED]
                and poll_count < max_polls
            ):
                await asyncio.sleep(0.1)

                status_response = await client.get(
                    "/api/v1/music/analysis/status",
                    headers={"Authorization": f"Bearer {valid_jwt_token}"},
                )

                assert status_response.status_code == 200
                status_data = status_response.json()
                status = status_data["status"]
                poll_count += 1

            # Should eventually fail
            assert status == AnalysisStatus.FAILED

            # Verify error message is present in status response
            final_status_response = await client.get(
                "/api/v1/music/analysis/status",
                headers={"Authorization": f"Bearer {valid_jwt_token}"},
            )

            final_status_data = final_status_response.json()
            assert final_status_data["error_message"] is not None
            assert (
                "Database error during share token generation"
                in final_status_data["error_message"]
            )

            # Trying to get results should fail
            result_response = await client.get(
                "/api/v1/music/analysis/result",
                headers={"Authorization": f"Bearer {valid_jwt_token}"},
            )

            assert result_response.status_code == 400
            error_data = result_response.json()
            assert "not completed" in error_data["detail"].lower()

    @pytest.mark.asyncio
    async def test_authentication_required(
        self,
        client: AsyncClient,
    ):
        """Test that all endpoints require authentication."""

        # Test begin analysis without token
        begin_response = await client.post("/api/v1/music/analysis/begin")
        assert begin_response.status_code == 403

        # Test status without token
        status_response = await client.get("/api/v1/music/analysis/status")
        assert status_response.status_code == 403

        # Test result without token
        result_response = await client.get("/api/v1/music/analysis/result")
        assert result_response.status_code == 403

        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token"}

        begin_response = await client.post(
            "/api/v1/music/analysis/begin", headers=invalid_headers
        )
        assert begin_response.status_code == 401

        status_response = await client.get(
            "/api/v1/music/analysis/status", headers=invalid_headers
        )
        assert status_response.status_code == 401

        result_response = await client.get(
            "/api/v1/music/analysis/result", headers=invalid_headers
        )
        assert result_response.status_code == 401

    @pytest.mark.asyncio
    async def test_no_analysis_found_scenarios(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        sample_user_data: dict,
    ):
        """Test scenarios where no analysis exists for user."""

        # Create test user within the test to avoid greenlet issues
        from src.unwrapped.auth.models import UserCreate
        from src.unwrapped.core.security import create_user_token

        user_create = UserCreate(**sample_user_data)
        test_user = User(**user_create.model_dump())
        test_user.access_token = "test_access_token"
        test_user.refresh_token = "test_refresh_token"

        async_session.add(test_user)
        await async_session.commit()
        await async_session.refresh(test_user)

        # Create JWT token for this user
        valid_jwt_token = create_user_token(test_user.id)

        # Test status when no analysis exists
        status_response = await client.get(
            "/api/v1/music/analysis/status",
            headers={"Authorization": f"Bearer {valid_jwt_token}"},
        )
        assert status_response.status_code == 404
        error_data = status_response.json()
        assert "No analysis found" in error_data["detail"]

        # Test result when no analysis exists
        result_response = await client.get(
            "/api/v1/music/analysis/result",
            headers={"Authorization": f"Bearer {valid_jwt_token}"},
        )
        assert result_response.status_code == 404
        error_data = result_response.json()
        assert "No analysis found" in error_data["detail"]

    @pytest.mark.asyncio
    async def test_analysis_with_existing_user_data(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        sample_user_data: dict,
        mock_spotify_client: AsyncMock,
    ):
        """Test analysis workflow with a user that has existing Spotify tokens."""

        # Create a user with Spotify tokens
        from src.unwrapped.core.security import create_user_token

        test_user_with_tokens = User(
            spotify_id="test_spotify_user_with_tokens",
            email="test_with_tokens@example.com",
            display_name="Test User With Tokens",
            country="US",
            access_token="valid_spotify_access_token",
            refresh_token="valid_spotify_refresh_token",
            token_expires_at=datetime.now(UTC) + timedelta(hours=1),
        )

        async_session.add(test_user_with_tokens)
        await async_session.commit()
        await async_session.refresh(test_user_with_tokens)

        # Create a JWT token for this user
        user_jwt_token = create_user_token(test_user_with_tokens.id)

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
                "src.unwrapped.music.background_tasks.MusicAnalysisAI"
            ) as mock_ai_class,
        ):
            mock_ai_instance = mock_ai_class.return_value
            mock_ai_instance.analyze_music_taste = AsyncMock(
                return_value={
                    "rating_text": "TOKEN USER TEST",
                    "rating_description": "Analysis for user with existing tokens.",
                    "x_axis_pos": -0.2,
                    "y_axis_pos": 0.8,
                }
            )

            # Begin analysis
            begin_response = await client.post(
                "/api/v1/music/analysis/begin",
                headers={"Authorization": f"Bearer {user_jwt_token}"},
            )

            assert begin_response.status_code == 200
            begin_data = begin_response.json()
            assert begin_data["status"] == AnalysisStatus.PENDING

            # Wait for completion
            max_polls = 20
            poll_count = 0
            status = AnalysisStatus.PENDING

            while (
                status not in [AnalysisStatus.COMPLETED, AnalysisStatus.FAILED]
                and poll_count < max_polls
            ):
                await asyncio.sleep(0.1)

                status_response = await client.get(
                    "/api/v1/music/analysis/status",
                    headers={"Authorization": f"Bearer {user_jwt_token}"},
                )

                assert status_response.status_code == 200
                status_data = status_response.json()
                status = status_data["status"]
                poll_count += 1

            assert status == AnalysisStatus.COMPLETED

            # Get results
            result_response = await client.get(
                "/api/v1/music/analysis/result",
                headers={"Authorization": f"Bearer {user_jwt_token}"},
            )

            assert result_response.status_code == 200
            result_data = result_response.json()
            assert result_data["rating_text"] == "TOKEN USER TEST"
            assert result_data["x_axis_pos"] == -0.2
            assert result_data["y_axis_pos"] == 0.8
