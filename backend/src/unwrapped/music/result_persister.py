"""Result persistence service for music analysis."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import desc, select

from ..core.exceptions import SpotifyAPIError
from ..core.logging import get_logger
from .models import MusicAnalysisResponse, MusicAnalysisResult, PublicAnalysisResponse
from .sharing import generate_unique_share_token


class ResultPersister:
    """Service for persisting and retrieving music analysis results."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = get_logger(__name__)

    async def save_analysis_result(
        self, user_id: int, analysis_result: dict[str, any]
    ) -> MusicAnalysisResponse:
        """Save analysis result to database and return response."""
        try:
            # Generate unique share token
            share_token = await generate_unique_share_token(self.session)

            # Store result in database
            db_result = MusicAnalysisResult(
                user_id=user_id,
                rating_text=analysis_result["rating_text"],
                rating_description=analysis_result["rating_description"],
                x_axis_pos=analysis_result["x_axis_pos"],
                y_axis_pos=analysis_result["y_axis_pos"],
                share_token=share_token,
            )

            self.session.add(db_result)
            await self.session.commit()
            await self.session.refresh(db_result)

            self.logger.info(
                "Analysis result saved successfully",
                extra={
                    "user_id": user_id,
                    "share_token": share_token,
                    "rating_text": analysis_result["rating_text"],
                },
            )

            # Return response
            return MusicAnalysisResponse(
                rating_text=db_result.rating_text,
                rating_description=db_result.rating_description,
                x_axis_pos=db_result.x_axis_pos,
                y_axis_pos=db_result.y_axis_pos,
                share_token=db_result.share_token,
                analyzed_at=db_result.created_at,
            )

        except Exception as e:
            raise SpotifyAPIError(f"Failed to save analysis result: {e}") from e

    async def get_latest_analysis(self, user_id: int) -> MusicAnalysisResponse | None:
        """Get the user's most recent music analysis."""
        try:
            stmt = (
                select(MusicAnalysisResult)
                .where(MusicAnalysisResult.user_id == user_id)
                .order_by(desc(MusicAnalysisResult.created_at))
                .limit(1)
            )

            result = await self.session.execute(stmt)
            analysis = result.scalar_one_or_none()

            if not analysis:
                return None

            return MusicAnalysisResponse(
                rating_text=analysis.rating_text,  # type: ignore[attr-defined]
                rating_description=analysis.rating_description,  # type: ignore[attr-defined]
                x_axis_pos=analysis.x_axis_pos,  # type: ignore[attr-defined]
                y_axis_pos=analysis.y_axis_pos,  # type: ignore[attr-defined]
                share_token=analysis.share_token,
                analyzed_at=analysis.created_at,
            )

        except Exception as e:
            raise SpotifyAPIError(f"Failed to get latest analysis: {e}") from e

    async def get_analysis_by_share_token(
        self, share_token: str
    ) -> PublicAnalysisResponse:
        """Get analysis result by share token for public viewing."""
        try:
            stmt = select(MusicAnalysisResult).where(
                MusicAnalysisResult.share_token == share_token
            )
            result = await self.session.execute(stmt)
            analysis = result.scalar_one_or_none()

            if not analysis:
                raise SpotifyAPIError("Analysis not found")

            return PublicAnalysisResponse(
                rating_text=analysis.rating_text,  # type: ignore[attr-defined]
                rating_description=analysis.rating_description,  # type: ignore[attr-defined]
                x_axis_pos=analysis.x_axis_pos,  # type: ignore[attr-defined]
                y_axis_pos=analysis.y_axis_pos,  # type: ignore[attr-defined]
                analyzed_at=analysis.created_at,
            )

        except Exception as e:
            raise SpotifyAPIError(f"Failed to get analysis by share token: {e}") from e
