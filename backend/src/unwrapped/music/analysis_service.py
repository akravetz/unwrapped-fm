"""Music analysis service for AI-powered music taste analysis."""

from sqlalchemy.ext.asyncio import AsyncSession

from .analysis_coordinator import AnalysisCoordinator
from .models import MusicAnalysisResponse, PublicAnalysisResponse
from .result_persister import ResultPersister


class MusicAnalysisService:
    """Service for analyzing user's music taste with AI."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.coordinator = AnalysisCoordinator(session)
        self.result_persister = ResultPersister(session)





    async def analyze_user_music_taste(self, user_id: int) -> MusicAnalysisResponse:
        """Analyze user's music taste and return AI verdict."""
        return await self.coordinator.analyze_user_music_taste(user_id)

    async def get_latest_analysis(self, user_id: int) -> MusicAnalysisResponse | None:
        """Get the user's most recent music analysis."""
        return await self.result_persister.get_latest_analysis(user_id)

    async def get_analysis_by_share_token(
        self, share_token: str
    ) -> PublicAnalysisResponse:
        """Get analysis result by share token for public viewing."""
        return await self.result_persister.get_analysis_by_share_token(share_token)
