"""Token refresh service for managing Spotify authentication tokens."""

from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.service import UserService
from ..core.exceptions import SpotifyAPIError
from ..core.logging import get_logger
from .spotify import spotify_music_client


class TokenRefreshService:
    """Service for managing Spotify token lifecycle."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.spotify_client = spotify_music_client
        self.logger = get_logger(__name__)

    async def get_valid_access_token(self, user_id: int) -> str:
        """Get valid access token, refreshing if necessary."""
        user_service = UserService(self.session)
        user = await user_service.get_user_by_id(user_id)
        if not user:
            raise SpotifyAPIError(f"User {user_id} not found")

        if not user.access_token:
            raise SpotifyAPIError("User has no Spotify access token")

        # Check if token expires soon (within 5 minutes)
        if user.token_expires_at:
            expires_soon = datetime.now(UTC) + timedelta(minutes=5)
            if user.token_expires_at <= expires_soon:
                # Token expired or expires soon, refresh it
                if not user.refresh_token:
                    raise SpotifyAPIError("Spotify refresh token not available")

                try:
                    # Refresh the token
                    token_info = await self.spotify_client.refresh_access_token(
                        user.refresh_token
                    )

                    # Update user with new token info
                    user.access_token = token_info.access_token
                    user.refresh_token = token_info.refresh_token
                    user.token_expires_at = datetime.now(UTC) + timedelta(
                        seconds=token_info.expires_in
                    )

                    # Save updated user
                    self.session.add(user)
                    await self.session.commit()
                    await self.session.refresh(user)

                    self.logger.info(
                        "Successfully refreshed Spotify token",
                        extra={"user_id": user_id},
                    )

                    return token_info.access_token

                except Exception as e:
                    raise SpotifyAPIError(
                        f"Failed to refresh Spotify token: {e}"
                    ) from e

        return user.access_token

    async def is_token_valid(self, user_id: int) -> bool:
        """Check if user's token is valid without refreshing."""
        user_service = UserService(self.session)
        user = await user_service.get_user_by_id(user_id)

        if not user or not user.access_token:
            return False

        if not user.token_expires_at:
            return True  # Assume valid if no expiration info

        # Check if token expires within 5 minutes
        expires_soon = datetime.now(UTC) + timedelta(minutes=5)
        return user.token_expires_at > expires_soon
