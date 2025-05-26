"""Authentication API endpoints.

CRITICAL CONFIGURATION REQUIREMENT:
- This application uses 127.0.0.1 for development consistency
- Spotify app dashboard MUST have redirect URI: https://127.0.0.1:8443/api/v1/auth/callback
- Frontend accessible at: https://127.0.0.1:5174
- Callback redirects will fail if Spotify app dashboard has different URI
"""

import logging
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from ..core import create_user_token, get_current_user_id, get_session
from ..core.config import settings
from .models import UserRead
from .service import UserService
from .spotify import spotify_auth_client

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


@router.get("/login")
async def login() -> dict[str, str]:
    """Initiate Spotify OAuth flow."""
    try:
        auth_url = spotify_auth_client.get_auth_url()
        return {"authorization_url": auth_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate login: {str(e)}",
        ) from e


@router.get("/callback")
async def callback(
    code: str = Query(...),
    state: str = Query(None),
    error: str = Query(None),
    session: AsyncSession = Depends(get_session),
) -> RedirectResponse:
    """Handle Spotify OAuth callback."""
    logger.info(
        f"OAuth callback received - code: {code[:20] if code else None}..., error: {error}"
    )
    logger.info(f"Frontend URL configured as: {settings.frontend_url}")

    if error:
        # Redirect to frontend with error
        redirect_url = f"{settings.frontend_url}?error={error}"
        logger.info(f"Redirecting to frontend with error: {redirect_url}")
        return RedirectResponse(
            url=redirect_url,
            status_code=status.HTTP_302_FOUND,
        )

    try:
        logger.info("Starting Spotify token exchange...")
        # Exchange code for tokens
        spotify_token = await spotify_auth_client.exchange_code_for_token(code)
        logger.info("Successfully obtained Spotify tokens")

        # Get user profile from Spotify
        spotify_user = await spotify_auth_client.get_current_user(
            spotify_token.access_token
        )
        logger.info(
            f"Retrieved Spotify user: {spotify_user.get('display_name', 'Unknown')}"
        )

        # Create or update user in database
        user_service = UserService(session)
        user = await user_service.create_or_update_user_from_spotify(
            spotify_user=spotify_user,
            spotify_token=spotify_token,
        )
        logger.info(f"User created/updated in database: {user.id}")

        # Create JWT token for our app
        if user.id is None:
            raise HTTPException(
                status_code=500, detail="User ID is None after creation"
            )
        jwt_token = create_user_token(user.id)
        logger.info("JWT token created successfully")

        # Redirect to frontend with token
        redirect_url = f"{settings.frontend_url}?token={jwt_token}"
        logger.info(f"Redirecting to frontend with token: {redirect_url}")
        return RedirectResponse(
            url=redirect_url,
            status_code=status.HTTP_302_FOUND,
        )

    except Exception as e:
        logger.error(f"OAuth callback error: {str(e)}", exc_info=True)
        # Redirect to frontend with error
        redirect_url = f"{settings.frontend_url}?error=authentication_failed"
        logger.info(f"Redirecting to frontend with error: {redirect_url}")
        return RedirectResponse(
            url=redirect_url,
            status_code=status.HTTP_302_FOUND,
        )


@router.get("/me", response_model=UserRead)
async def get_current_user(
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> UserRead:
    """Get current authenticated user."""
    user_service = UserService(session)
    user = await user_service.get_user_by_id(current_user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return UserRead.model_validate(user)


@router.post("/logout")
async def logout() -> dict[str, str]:
    """Logout user (client-side token removal)."""
    return {
        "message": "Logged out successfully. Please remove the token from client storage."
    }


@router.get("/status")
async def auth_status(
    current_user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Check authentication status and token validity."""
    user_service = UserService(session)
    user = await user_service.get_user_by_id(current_user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Check if Spotify token is still valid
    spotify_token_valid = (
        user.token_expires_at and user.token_expires_at > datetime.now(UTC)
    )

    return {
        "authenticated": True,
        "user_id": user.id,
        "spotify_connected": bool(user.access_token),
        "spotify_token_valid": spotify_token_valid,
        "display_name": user.display_name,
    }
