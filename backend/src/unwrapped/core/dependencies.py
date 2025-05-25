"""FastAPI dependencies for dependency injection."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_session
from .security import verify_token

# Token scheme
security = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> int:
    """Get current user ID from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_token(credentials.credentials)
    if payload is None:
        raise credentials_exception

    user_id: int | None = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    return int(user_id)


async def get_current_user_id_with_session(
    session: AsyncSession = Depends(get_session),
    current_user_id: int = Depends(get_current_user_id),
) -> tuple[AsyncSession, int]:
    """Get both database session and current user ID for authenticated endpoints."""
    return session, current_user_id
