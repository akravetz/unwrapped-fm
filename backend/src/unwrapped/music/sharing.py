"""Sharing utilities for music analysis results."""

import secrets
import string

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from .models import MusicAnalysisResult


def generate_share_token() -> str:
    """Generate cryptographically secure 15-character share token.

    Uses uppercase letters, lowercase letters, and digits (62 possibilities per character).
    Total combinations: 62^15 = ~1.4 × 10^26 possibilities.
    """
    alphabet = string.ascii_letters + string.digits  # a-z, A-Z, 0-9 (62 chars)
    return "".join(secrets.choice(alphabet) for _ in range(15))


async def generate_unique_share_token(session: AsyncSession) -> str:
    """Generate a unique share token that doesn't exist in the database.

    While collisions are extremely unlikely (1 in 10^26), this ensures uniqueness.
    """
    max_attempts = 10  # Safety limit, should never be needed

    for _ in range(max_attempts):
        token = generate_share_token()

        # Check if token already exists
        stmt = select(MusicAnalysisResult).where(
            MusicAnalysisResult.share_token == token
        )
        result = await session.execute(stmt)
        existing = result.scalar_one_or_none()

        if not existing:
            return token

    # This should never happen with 62^15 possibilities
    raise RuntimeError("Failed to generate unique share token after maximum attempts")
