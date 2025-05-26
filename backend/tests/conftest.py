"""Test configuration and fixtures."""

import asyncio
import re
from collections.abc import AsyncGenerator
from collections.abc import AsyncGenerator as AsyncGen
from unittest.mock import AsyncMock, Mock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlmodel import SQLModel
from testcontainers.postgres import PostgresContainer

# Import all models to register them with SQLModel.metadata
import src.unwrapped.auth.models  # noqa: F401
import src.unwrapped.music.models  # noqa: F401
from src.unwrapped.auth.models import User, UserCreate
from src.unwrapped.core.database import get_session
from src.unwrapped.core.security import create_user_token
from src.unwrapped.main import app
from tests.utils.atlas import apply_atlas_migrations, check_atlas_available


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def postgres_container():
    """Create a PostgreSQL test container for the session with Atlas migrations applied."""
    with PostgresContainer("postgres:15") as postgres:
        # Get the standard connection URL for Atlas
        postgres_url = postgres.get_connection_url()

        # Check if Atlas is available and try to apply migrations
        atlas_applied = False
        if check_atlas_available():
            try:
                # Apply Atlas migrations to the test database
                apply_atlas_migrations(postgres_url)
                atlas_applied = True
                print("Atlas migrations applied successfully to test database")
            except RuntimeError as e:
                # If Atlas migration fails, we'll fall back to SQLModel fallback: {e}")
                print(
                    f"Warning: Atlas migration failed, will use SQLModel fallback: {e}"
                )
        else:
            print(
                "Warning: Atlas CLI not available, will use SQLModel.metadata.create_all"
            )

        # Store whether Atlas was applied for use in async_engine fixture
        postgres._atlas_applied = atlas_applied
        yield postgres


@pytest_asyncio.fixture(scope="session")
async def async_engine(postgres_container):
    """Create async test database engine with session scope using asyncpg."""
    # Get the standard connection URL and convert to asyncpg format
    postgres_url = postgres_container.get_connection_url()

    # Replace postgres[ql][+driver]:// with postgresql+asyncpg:// for asyncpg driver
    database_url = re.sub(
        r"postgres(?:ql)?(?:\+\w+)?://", "postgresql+asyncpg://", postgres_url
    )

    engine = create_async_engine(database_url, echo=False)

    # Only create tables if Atlas migrations weren't applied successfully
    if not getattr(postgres_container, "_atlas_applied", False):
        print("Creating tables using SQLModel.metadata.create_all")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    yield engine

    # Clean up
    await engine.dispose()


@pytest_asyncio.fixture
async def async_session(async_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a new async session for each test with proper transaction rollback.

    This implements the SQLAlchemy joining session pattern for test isolation:
    https://docs.sqlalchemy.org/en/20/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites
    """
    async with async_engine.connect() as connection:
        # Begin an external transaction
        trans = await connection.begin()

        # Create session bound to this connection with savepoint mode
        session = AsyncSession(
            bind=connection, join_transaction_mode="create_savepoint"
        )

        try:
            yield session
        finally:
            await session.close()
            # Rollback the external transaction - this undoes all changes
            await trans.rollback()


@pytest_asyncio.fixture
async def client(async_session) -> AsyncGen[AsyncClient, None]:
    """Create async test client with database override that uses the same session."""

    def override_get_session():
        """Override to yield the same session used in tests."""
        yield async_session

    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client

    # Clean up dependency overrides
    app.dependency_overrides.clear()


@pytest.fixture
def mock_spotify_client():
    """Mock Spotify client for testing."""
    mock = AsyncMock()
    mock.get_auth_url.return_value = (
        "https://accounts.spotify.com/authorize?client_id=test"
    )
    mock.exchange_code_for_token.return_value = Mock(
        access_token="test_access_token",
        refresh_token="test_refresh_token",
        expires_in=3600,
    )
    mock.refresh_access_token.return_value = Mock(
        access_token="new_access_token",
        refresh_token="new_refresh_token",
        expires_in=3600,
    )
    mock.get_current_user.return_value = {
        "id": "test_spotify_id",
        "display_name": "Test User",
        "email": "test@example.com",
        "country": "US",
        "images": [{"url": "https://example.com/image.jpg"}],
    }
    # Enhanced mock methods for music testing with async support
    mock.get_user_top_tracks.return_value = {
        "items": [
            {
                "id": "track1",
                "name": "Test Track",
                "artists": [{"name": "Test Artist"}],
                "album": {"name": "Test Album"},
                "duration_ms": 180000,
                "explicit": False,
                "popularity": 75,
                "preview_url": "https://example.com/preview.mp3",
            }
        ]
    }
    mock.get_user_top_artists.return_value = {
        "items": [
            {
                "id": "artist1",
                "name": "Test Artist",
                "genres": ["pop", "rock"],
                "popularity": 85,
                "followers": {"total": 1000000},
                "images": [{"url": "https://example.com/artist.jpg"}],
            }
        ]
    }
    mock.get_recently_played.return_value = {
        "items": [
            {
                "track": {
                    "id": "recent1",
                    "name": "Recent Track",
                    "artists": [{"name": "Recent Artist"}],
                    "album": {"name": "Recent Album"},
                    "duration_ms": 190000,
                    "explicit": False,
                    "popularity": 70,
                    "preview_url": "https://example.com/recent.mp3",
                },
                "played_at": "2024-01-15T10:30:00Z",
            }
        ]
    }
    mock.get_audio_features.return_value = {
        "audio_features": [
            {
                "id": "track1",
                "danceability": 0.7,
                "energy": 0.8,
                "key": 5,
                "loudness": -5.0,
                "mode": 1,
                "speechiness": 0.05,
                "acousticness": 0.2,
                "instrumentalness": 0.0,
                "liveness": 0.1,
                "valence": 0.6,
                "tempo": 120.0,
                "time_signature": 4,
            }
        ]
    }
    mock.get_track_details.return_value = {
        "tracks": [
            {
                "id": "track1",
                "name": "Test Track",
                "artists": [{"id": "artist1", "name": "Test Artist"}],
                "album": {
                    "id": "album1",
                    "name": "Test Album",
                    "artists": [{"id": "artist1", "name": "Test Artist"}],
                },
                "duration_ms": 180000,
                "explicit": False,
                "popularity": 75,
                "preview_url": "https://example.com/preview.mp3",
            }
        ]
    }
    mock.get_artist_details.return_value = {
        "artists": [
            {
                "id": "artist1",
                "name": "Test Artist",
                "genres": ["pop", "rock"],
                "popularity": 85,
                "followers": {"total": 1000000},
                "images": [{"url": "https://example.com/artist.jpg"}],
            }
        ]
    }
    return mock


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "spotify_id": "test_spotify_id",
        "email": "test@example.com",
        "display_name": "Test User",
        "country": "US",
        "image_url": "https://example.com/image.jpg",
    }


@pytest_asyncio.fixture
async def test_user(async_session: AsyncSession, sample_user_data) -> User:
    """Create a test user in the database."""
    user_create = UserCreate(**sample_user_data)
    user = User(**user_create.model_dump())
    user.access_token = "test_access_token"
    user.refresh_token = "test_refresh_token"

    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)

    return user


@pytest.fixture
def mock_settings():
    """Mock settings for testing."""
    return Mock(
        spotify_client_id="test_client_id",
        spotify_client_secret="test_client_secret",
        spotify_redirect_uri="https://127.0.0.1:8443/api/v1/auth/callback",
        frontend_url="https://127.0.0.1:5174",
        secret_key="test_secret_key_for_jwt_tokens_in_testing_environment_12345",
        algorithm="HS256",
        access_token_expire_minutes=30,
    )


@pytest.fixture
def valid_jwt_token(test_user):
    """Create a valid JWT token for testing authenticated endpoints."""
    return create_user_token(test_user.id)
