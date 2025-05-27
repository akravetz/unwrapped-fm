"""Tests for authentication endpoints."""

from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import HTTPException

from src.unwrapped.auth.models import SpotifyToken
from src.unwrapped.core.security import create_user_token


class TestAuthEndpoints:
    """Test cases for authentication endpoints."""

    @pytest.mark.asyncio
    async def test_login_endpoint_success(self, client):
        """Test successful login endpoint."""
        with patch("src.unwrapped.auth.router.spotify_auth_client") as mock_spotify:
            mock_spotify.get_auth_url.return_value = (
                "https://accounts.spotify.com/authorize?client_id=test"
            )

            response = await client.get("/api/v1/auth/login")

            assert response.status_code == 200
            data = response.json()
            assert "authorization_url" in data
            assert data["authorization_url"].startswith(
                "https://accounts.spotify.com/authorize"
            )

    @pytest.mark.asyncio
    async def test_login_endpoint_spotify_error(self, client):
        """Test login endpoint with Spotify client error."""
        with patch("src.unwrapped.auth.router.spotify_auth_client") as mock_spotify:
            mock_spotify.get_auth_url.side_effect = Exception(
                "Spotify configuration error"
            )

            response = await client.get("/api/v1/auth/login")

            assert response.status_code == 500
            assert "Failed to initiate login" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_callback_endpoint_error_parameter(self, client):
        """Test callback endpoint with error parameter."""
        # The callback endpoint requires a 'code' parameter, so passing only 'error' returns 422
        response = await client.get("/api/v1/auth/callback?error=access_denied")

        assert response.status_code == 422

    @pytest.mark.asyncio
    @patch("src.unwrapped.auth.router.spotify_auth_client")
    @patch("src.unwrapped.auth.router.UserService")
    async def test_callback_endpoint_success(
        self, mock_user_service, mock_spotify, client, test_user
    ):
        """Test successful OAuth callback."""
        # Mock Spotify token exchange
        mock_token = SpotifyToken(
            access_token="test_access_token",
            refresh_token="test_refresh_token",
            expires_in=3600,
            token_type="Bearer",
        )
        mock_spotify.exchange_code_for_token = AsyncMock(return_value=mock_token)

        # Mock Spotify user profile
        mock_spotify.get_current_user = AsyncMock(
            return_value={
                "id": "spotify_user_id",
                "display_name": "Test User",
                "email": "test@example.com",
            }
        )

        # Mock user service
        mock_service_instance = Mock()
        mock_service_instance.create_or_update_user_from_spotify = AsyncMock(
            return_value=test_user
        )
        mock_user_service.return_value = mock_service_instance

        response = await client.get("/api/v1/auth/callback?code=test_code")

        assert response.status_code == 302
        # The actual redirect URL contains 'token=' not 'access_token='
        assert "token=" in response.headers["location"]

    @pytest.mark.asyncio
    @patch("src.unwrapped.auth.router.spotify_auth_client")
    async def test_callback_endpoint_spotify_error(self, mock_spotify, client):
        """Test callback endpoint with Spotify API error."""
        mock_spotify.exchange_code_for_token = AsyncMock(
            side_effect=HTTPException(status_code=400, detail="Invalid code")
        )

        response = await client.get("/api/v1/auth/callback?code=invalid_code")

        assert response.status_code == 302
        assert "error=" in response.headers["location"]

    @pytest.mark.asyncio
    async def test_me_endpoint_success(self, client, test_user, valid_jwt_token):
        """Test getting current user profile."""
        headers = {"Authorization": f"Bearer {valid_jwt_token}"}

        response = await client.get("/api/v1/auth/me", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["spotify_id"] == test_user.spotify_id
        assert data["email"] == test_user.email
        assert data["display_name"] == test_user.display_name

    @pytest.mark.asyncio
    async def test_me_endpoint_no_token(self, client):
        """Test getting current user without token."""
        response = await client.get("/api/v1/auth/me")

        assert (
            response.status_code == 403
        )  # FastAPI security returns 403 for missing auth

    @pytest.mark.asyncio
    async def test_me_endpoint_invalid_token(self, client):
        """Test getting current user with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}

        response = await client.get("/api/v1/auth/me", headers=headers)

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_me_endpoint_user_not_found(self, client):
        """Test getting current user when user doesn't exist in database."""
        # Create token for non-existent user
        token = create_user_token(99999)
        headers = {"Authorization": f"Bearer {token}"}

        response = await client.get("/api/v1/auth/me", headers=headers)

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_logout_endpoint(self, client):
        """Test logout endpoint."""
        response = await client.post("/api/v1/auth/logout")

        assert response.status_code == 200
        data = response.json()
        assert "Logged out successfully" in data["message"]

    @pytest.mark.asyncio
    async def test_status_endpoint_success(self, client, test_user, valid_jwt_token):
        """Test getting authentication status with valid token."""
        headers = {"Authorization": f"Bearer {valid_jwt_token}"}

        response = await client.get("/api/v1/auth/status", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True
        assert data["user_id"] == test_user.id
        # Status endpoint returns different fields than /me endpoint
        assert data["display_name"] == test_user.display_name
        assert "spotify_connected" in data
        assert "spotify_token_valid" in data

    @pytest.mark.asyncio
    async def test_status_endpoint_no_token(self, client):
        """Test status endpoint without token."""
        response = await client.get("/api/v1/auth/status")

        assert (
            response.status_code == 403
        )  # FastAPI security returns 403 for missing auth

    @pytest.mark.asyncio
    async def test_status_endpoint_invalid_token(self, client):
        """Test status endpoint with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}

        response = await client.get("/api/v1/auth/status", headers=headers)

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_status_endpoint_user_not_found(self, client):
        """Test status endpoint when user doesn't exist in database."""
        token = create_user_token(99999)
        headers = {"Authorization": f"Bearer {token}"}

        response = await client.get("/api/v1/auth/status", headers=headers)

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_status_endpoint_token_validation(
        self, client, test_user, valid_jwt_token
    ):
        """Test status endpoint validates token properly."""
        headers = {"Authorization": f"Bearer {valid_jwt_token}"}

        response = await client.get("/api/v1/auth/status", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True
        assert data["user_id"] == test_user.id
        assert data["display_name"] == test_user.display_name
        # Status endpoint doesn't return spotify_id, it has different fields
        assert "spotify_connected" in data
        assert "spotify_token_valid" in data
