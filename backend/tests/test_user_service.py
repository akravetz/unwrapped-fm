"""Tests for user service functionality."""

import pytest

from src.unwrapped.auth.models import SpotifyToken, UserCreate, UserUpdate
from src.unwrapped.auth.service import UserService


@pytest.mark.asyncio
class TestUserService:
    """Test cases for UserService functionality."""

    @pytest.mark.asyncio
    async def test_get_user_by_id_existing(self, async_session, test_user):
        """Test getting a user by ID that exists."""
        service = UserService(async_session)

        result = await service.get_user_by_id(test_user.id)

        assert result is not None
        assert result.id == test_user.id
        assert result.spotify_id == test_user.spotify_id

    @pytest.mark.asyncio
    async def test_get_user_by_id_nonexistent(self, async_session):
        """Test getting a user by ID that doesn't exist."""
        service = UserService(async_session)

        result = await service.get_user_by_id(99999)

        assert result is None

    @pytest.mark.asyncio
    async def test_get_user_by_spotify_id_existing(self, async_session, test_user):
        """Test getting a user by Spotify ID that exists."""
        service = UserService(async_session)

        result = await service.get_user_by_spotify_id(test_user.spotify_id)

        assert result is not None
        assert result.spotify_id == test_user.spotify_id
        assert result.id == test_user.id

    @pytest.mark.asyncio
    async def test_get_user_by_spotify_id_nonexistent(self, async_session):
        """Test getting a user by Spotify ID that doesn't exist."""
        service = UserService(async_session)

        result = await service.get_user_by_spotify_id("nonexistent_spotify_id")

        assert result is None

    @pytest.mark.asyncio
    async def test_get_user_by_email_existing(self, async_session, test_user):
        """Test getting a user by email that exists."""
        service = UserService(async_session)

        result = await service.get_user_by_email(test_user.email)

        assert result is not None
        assert result.email == test_user.email
        assert result.id == test_user.id

    @pytest.mark.asyncio
    async def test_get_user_by_email_nonexistent(self, async_session):
        """Test getting a user by email that doesn't exist."""
        service = UserService(async_session)

        result = await service.get_user_by_email("nonexistent@example.com")

        assert result is None

    @pytest.mark.asyncio
    async def test_create_user(self, async_session, sample_user_data):
        """Test creating a new user."""
        service = UserService(async_session)
        user_create = UserCreate(**sample_user_data)

        result = await service.create_user(user_create)

        assert result is not None
        assert result.spotify_id == sample_user_data["spotify_id"]
        assert result.email == sample_user_data["email"]
        assert result.display_name == sample_user_data["display_name"]
        assert result.country == sample_user_data["country"]
        assert result.image_url == sample_user_data["image_url"]
        assert result.is_active is True
        assert result.created_at is not None
        assert result.updated_at is not None

    @pytest.mark.asyncio
    async def test_update_user_existing(self, async_session, test_user):
        """Test updating an existing user."""
        service = UserService(async_session)

        update_data = UserUpdate(
            display_name="Updated Name",
            country="CA",
            image_url="https://example.com/new_image.jpg",
        )

        result = await service.update_user(test_user.id, update_data)

        assert result is not None
        assert result.display_name == "Updated Name"
        assert result.country == "CA"
        assert result.image_url == "https://example.com/new_image.jpg"
        # Unchanged fields should remain the same
        assert result.spotify_id == test_user.spotify_id
        assert result.email == test_user.email

    @pytest.mark.asyncio
    async def test_update_user_nonexistent(self, async_session):
        """Test updating a user that doesn't exist."""
        service = UserService(async_session)

        update_data = UserUpdate(display_name="New Name")
        result = await service.update_user(99999, update_data)

        assert result is None

    @pytest.mark.asyncio
    async def test_update_user_tokens_existing(self, async_session, test_user):
        """Test updating tokens for an existing user."""
        service = UserService(async_session)

        new_token = SpotifyToken(
            access_token="new_access_token",
            refresh_token="new_refresh_token",
            expires_in=3600,
            token_type="Bearer",
        )

        result = await service.update_user_tokens(test_user.id, new_token)

        assert result is not None
        assert result.access_token == "new_access_token"
        assert result.refresh_token == "new_refresh_token"
        assert result.token_expires_at is not None

    @pytest.mark.asyncio
    async def test_update_user_tokens_nonexistent(self, async_session):
        """Test updating tokens for a user that doesn't exist."""
        service = UserService(async_session)

        new_token = SpotifyToken(
            access_token="new_access_token",
            refresh_token="new_refresh_token",
            expires_in=3600,
            token_type="Bearer",
        )

        result = await service.update_user_tokens(99999, new_token)

        assert result is None

    @pytest.mark.asyncio
    async def test_create_or_update_user_from_spotify_new_user(self, async_session):
        """Test creating a new user from Spotify data."""
        service = UserService(async_session)

        spotify_data = {
            "id": "new_spotify_user",
            "display_name": "New Spotify User",
            "email": "newuser@spotify.com",
            "country": "SE",
            "images": [{"url": "https://spotify.com/image.jpg"}],
        }

        spotify_token = SpotifyToken(
            access_token="spotify_access_token",
            refresh_token="spotify_refresh_token",
            expires_in=3600,
            token_type="Bearer",
        )

        result = await service.create_or_update_user_from_spotify(
            spotify_data, spotify_token
        )

        assert result is not None
        assert result.spotify_id == "new_spotify_user"
        assert result.display_name == "New Spotify User"
        assert result.email == "newuser@spotify.com"
        assert result.country == "SE"
        assert result.image_url == "https://spotify.com/image.jpg"
        assert result.access_token == "spotify_access_token"
        assert result.refresh_token == "spotify_refresh_token"

    @pytest.mark.asyncio
    async def test_create_or_update_user_from_spotify_existing_user(
        self, async_session, test_user
    ):
        """Test updating an existing user from Spotify data."""
        service = UserService(async_session)

        spotify_data = {
            "id": test_user.spotify_id,
            "display_name": "Updated Display Name",
            "email": test_user.email,
            "country": "UK",
            "images": [{"url": "https://spotify.com/updated_image.jpg"}],
        }

        spotify_token = SpotifyToken(
            access_token="updated_access_token",
            refresh_token="updated_refresh_token",
            expires_in=3600,
            token_type="Bearer",
        )

        result = await service.create_or_update_user_from_spotify(
            spotify_data, spotify_token
        )

        assert result is not None
        assert result.id == test_user.id  # Same user
        assert result.display_name == "Updated Display Name"
        assert result.country == "UK"
        assert result.image_url == "https://spotify.com/updated_image.jpg"
        assert result.access_token == "updated_access_token"
        assert result.refresh_token == "updated_refresh_token"

    @pytest.mark.asyncio
    async def test_create_or_update_user_from_spotify_no_images(self, async_session):
        """Test creating user from Spotify data with no images."""
        service = UserService(async_session)

        spotify_data = {
            "id": "spotify_no_image",
            "display_name": "No Image User",
            "email": "noimage@spotify.com",
            "country": "NO",
            # No 'images' field
        }

        spotify_token = SpotifyToken(
            access_token="access_token",
            refresh_token="refresh_token",
            expires_in=3600,
            token_type="Bearer",
        )

        result = await service.create_or_update_user_from_spotify(
            spotify_data, spotify_token
        )

        assert result is not None
        assert result.spotify_id == "spotify_no_image"
        assert result.image_url is None

    @pytest.mark.asyncio
    async def test_create_or_update_user_from_spotify_empty_images(self, async_session):
        """Test creating user from Spotify data with empty images array."""
        service = UserService(async_session)

        spotify_data = {
            "id": "spotify_empty_images",
            "display_name": "Empty Images User",
            "email": "emptyimages@spotify.com",
            "country": "FI",
            "images": [],  # Empty array
        }

        spotify_token = SpotifyToken(
            access_token="access_token",
            refresh_token="refresh_token",
            expires_in=3600,
            token_type="Bearer",
        )

        result = await service.create_or_update_user_from_spotify(
            spotify_data, spotify_token
        )

        assert result is not None
        assert result.spotify_id == "spotify_empty_images"
        assert result.image_url is None
