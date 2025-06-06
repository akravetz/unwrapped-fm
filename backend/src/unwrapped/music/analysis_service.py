"""Music analysis service for AI-powered music taste analysis."""

from datetime import UTC, datetime

from fastapi import BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import desc, select

from ..core.logging import get_logger
from .background_tasks import process_music_analysis_task
from .models import (
    AnalysisStatus,
    AnalysisStatusResponse,
    BeginAnalysisResponse,
    MusicAnalysisResponse,
    MusicAnalysisResult,
    PublicAnalysisResponse,
)


class MusicAnalysisService:
    """Service for analyzing user's music taste with AI."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = get_logger(__name__)

    async def begin_analysis(
        self, user_id: int, background_tasks: BackgroundTasks
    ) -> BeginAnalysisResponse:
        """
        Begin music analysis for user. Returns existing analysis if found, creates new if none exists.

        Args:
            user_id: ID of the user requesting analysis
            background_tasks: FastAPI background tasks

        Returns:
            BeginAnalysisResponse with analysis ID and status
        """
        # Check for existing analysis by user_id (unique constraint ensures max 1)
        stmt = select(MusicAnalysisResult).where(MusicAnalysisResult.user_id == user_id)
        result = await self.session.execute(stmt)
        existing_analysis = result.scalar_one_or_none()

        if existing_analysis:
            # Return existing analysis regardless of status
            self.logger.info(
                f"Returning existing analysis for user {user_id}, status: {existing_analysis.status}"
            )
            return BeginAnalysisResponse(
                analysis_id=existing_analysis.id,
                status=existing_analysis.status,
            )

        # Create new analysis record with pending status
        new_analysis = MusicAnalysisResult(
            user_id=user_id,
            status=AnalysisStatus.PENDING,
            created_at=datetime.now(UTC),
        )

        self.session.add(new_analysis)
        await self.session.commit()
        await self.session.refresh(new_analysis)

        # Start background task
        background_tasks.add_task(
            process_music_analysis_task, new_analysis.id, user_id, self.session
        )

        self.logger.info(
            f"Created new analysis {new_analysis.id} for user {user_id}, starting background task"
        )

        return BeginAnalysisResponse(
            analysis_id=new_analysis.id,
            status=AnalysisStatus.PENDING,
        )

    async def poll_analysis(self, user_id: int) -> AnalysisStatusResponse:
        """
        Get current status of user's analysis.

        Args:
            user_id: ID of the user

        Returns:
            AnalysisStatusResponse with current status

        Raises:
            HTTPException: If no analysis found for user
        """
        stmt = select(MusicAnalysisResult).where(MusicAnalysisResult.user_id == user_id)
        result = await self.session.execute(stmt)
        analysis = result.scalar_one_or_none()

        if not analysis:
            raise HTTPException(status_code=404, detail="No analysis found for user")

        return AnalysisStatusResponse(
            analysis_id=analysis.id,
            status=analysis.status,
            error_message=analysis.error_message,
            created_at=analysis.created_at,
            started_at=analysis.started_at,
            completed_at=analysis.completed_at,
        )

    async def get_analysis(self, user_id: int) -> MusicAnalysisResponse:
        """
        Get completed analysis result for user.

        Args:
            user_id: ID of the user

        Returns:
            MusicAnalysisResponse with completed analysis data

        Raises:
            HTTPException: If analysis not completed or not found
        """
        stmt = select(MusicAnalysisResult).where(MusicAnalysisResult.user_id == user_id)
        result = await self.session.execute(stmt)
        analysis = result.scalar_one_or_none()

        if not analysis:
            raise HTTPException(status_code=404, detail="No analysis found for user")

        if analysis.status != AnalysisStatus.COMPLETED:
            raise HTTPException(
                status_code=400,
                detail=f"Analysis not completed. Current status: {analysis.status}",
            )

        # Ensure all required fields are present for completed analysis
        if not all(
            [
                analysis.rating_text,
                analysis.rating_description,
                analysis.critical_acclaim_score is not None,
                analysis.music_snob_score is not None,
                analysis.share_token,
            ]
        ):
            raise HTTPException(
                status_code=500,
                detail="Analysis marked as completed but missing required data",
            )

        return MusicAnalysisResponse(
            rating_text=analysis.rating_text,
            rating_description=analysis.rating_description,
            critical_acclaim_score=analysis.critical_acclaim_score,
            music_snob_score=analysis.music_snob_score,
            share_token=analysis.share_token,
            analyzed_at=analysis.completed_at or analysis.created_at,
        )

    async def get_analysis_by_share_token(
        self, share_token: str
    ) -> PublicAnalysisResponse:
        """
        Get analysis result by share token for public viewing.

        Args:
            share_token: The share token to look up

        Returns:
            PublicAnalysisResponse with analysis data (no sensitive info)

        Raises:
            HTTPException: If share token not found
        """
        try:
            stmt = select(MusicAnalysisResult).where(
                MusicAnalysisResult.share_token == share_token
            )
            result = await self.session.execute(stmt)
            analysis = result.scalar_one_or_none()

            if not analysis:
                self.logger.warning(f"Share token not found: {share_token}")
                raise HTTPException(status_code=404, detail="Analysis not found")

            # Ensure analysis is completed and has required data
            if analysis.status != AnalysisStatus.COMPLETED or not all(
                [
                    analysis.rating_text,
                    analysis.rating_description,
                    analysis.critical_acclaim_score is not None,
                    analysis.music_snob_score is not None,
                ]
            ):
                self.logger.warning(
                    f"Incomplete analysis accessed via share token: {share_token}"
                )
                raise HTTPException(status_code=404, detail="Analysis not found")

            self.logger.info(f"Public analysis accessed via share token: {share_token}")

            return PublicAnalysisResponse(
                rating_text=analysis.rating_text,
                rating_description=analysis.rating_description,
                critical_acclaim_score=analysis.critical_acclaim_score,
                music_snob_score=analysis.music_snob_score,
                analyzed_at=analysis.completed_at or analysis.created_at,
            )

        except HTTPException:
            raise  # Re-raise HTTP exceptions
        except Exception as e:
            self.logger.error(f"Failed to get analysis by share token: {e}")
            raise HTTPException(status_code=500, detail="Internal server error") from e

    async def get_latest_analysis(self, user_id: int) -> MusicAnalysisResponse | None:
        """
        Get the user's most recent music analysis.

        Args:
            user_id: ID of the user

        Returns:
            MusicAnalysisResponse if found, None if no analysis exists

        Raises:
            HTTPException: On database errors
        """
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

            # Only return completed analyses
            if analysis.status != AnalysisStatus.COMPLETED or not all(
                [
                    analysis.rating_text,
                    analysis.rating_description,
                    analysis.critical_acclaim_score is not None,
                    analysis.music_snob_score is not None,
                    analysis.share_token,
                ]
            ):
                return None

            return MusicAnalysisResponse(
                rating_text=analysis.rating_text,
                rating_description=analysis.rating_description,
                critical_acclaim_score=analysis.critical_acclaim_score,
                music_snob_score=analysis.music_snob_score,
                share_token=analysis.share_token,
                analyzed_at=analysis.completed_at or analysis.created_at,
            )

        except Exception as e:
            self.logger.error(f"Failed to get latest analysis for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error") from e
