"""Public music analysis endpoints (no authentication required)."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_session
from .analysis_service import MusicAnalysisService
from .models import PublicAnalysisResponse

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/share/{share_token}", response_model=PublicAnalysisResponse)
async def get_shared_analysis(
    share_token: str,
    session: AsyncSession = Depends(get_session),
) -> PublicAnalysisResponse:
    """Get a shared music analysis by token."""
    service = MusicAnalysisService(session)
    return await service.get_analysis_by_share_token(share_token)
