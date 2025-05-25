"""User service layer for authentication operations."""

from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import SpotifyToken, User, UserCreate, UserUpdate


class UserService:
    """User service for authentication and user management operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_by_id(self, user_id: int) -> User | None:
        """Get user by ID."""
        statement = select(User).where(User.id == user_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_user_by_spotify_id(self, spotify_id: str) -> User | None:
        """Get user by Spotify ID."""
        statement = select(User).where(User.spotify_id == spotify_id)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_user_by_email(self, email: str) -> User | None:
        """Get user by email."""
        statement = select(User).where(User.email == email)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user."""
        user = User(**user_data.model_dump())
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def update_user(self, user_id: int, user_data: UserUpdate) -> User | None:
        """Update user information."""
        user = await self.get_user_by_id(user_id)
        if not user:
            return None

        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        user.updated_at = datetime.now(UTC)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def update_user_tokens(
        self, user_id: int, spotify_token: SpotifyToken
    ) -> User | None:
        """Update user's Spotify tokens."""
        user = await self.get_user_by_id(user_id)
        if not user:
            return None

        user.access_token = spotify_token.access_token
        user.refresh_token = spotify_token.refresh_token
        user.token_expires_at = datetime.now(UTC) + timedelta(
            seconds=spotify_token.expires_in
        )
        user.updated_at = datetime.now(UTC)

        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def create_or_update_user_from_spotify(
        self, spotify_user: dict, spotify_token: SpotifyToken
    ) -> User:
        """Create or update user from Spotify profile data."""
        existing_user = await self.get_user_by_spotify_id(spotify_user["id"])

        if existing_user:
            # Update existing user
            existing_user.email = spotify_user.get("email", existing_user.email)
            existing_user.display_name = spotify_user.get(
                "display_name", existing_user.display_name
            )
            existing_user.country = spotify_user.get("country", existing_user.country)

            # Update image URL if available
            if spotify_user.get("images") and len(spotify_user["images"]) > 0:
                existing_user.image_url = spotify_user["images"][0]["url"]

            # Update tokens
            existing_user.access_token = spotify_token.access_token
            existing_user.refresh_token = spotify_token.refresh_token
            existing_user.token_expires_at = datetime.now(UTC) + timedelta(
                seconds=spotify_token.expires_in
            )
            existing_user.updated_at = datetime.now(UTC)

            await self.session.commit()
            await self.session.refresh(existing_user)
            return existing_user
        else:
            # Create new user
            image_url = None
            if spotify_user.get("images") and len(spotify_user["images"]) > 0:
                image_url = spotify_user["images"][0]["url"]

            user_data = UserCreate(
                spotify_id=spotify_user["id"],
                email=spotify_user.get("email", ""),
                display_name=spotify_user.get("display_name"),
                country=spotify_user.get("country"),
                image_url=image_url,
            )

            user = User(**user_data.model_dump())
            user.access_token = spotify_token.access_token
            user.refresh_token = spotify_token.refresh_token
            user.token_expires_at = datetime.now(UTC) + timedelta(
                seconds=spotify_token.expires_in
            )

            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
            return user
