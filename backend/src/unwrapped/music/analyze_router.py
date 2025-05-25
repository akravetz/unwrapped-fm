"""Music analysis API router for AI-powered music taste analysis."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_session
from ..core.dependencies import get_current_user_id
from ..core.exceptions import SpotifyAPIError
from .analysis_service import MusicAnalysisService
from .models import MusicAnalysisResponse

router = APIRouter(tags=["music-analysis"])


@router.post("/music/analyze", response_model=MusicAnalysisResponse)
async def analyze_music_taste(
    session: AsyncSession = Depends(get_session),
    current_user_id: int = Depends(get_current_user_id),
) -> MusicAnalysisResponse:
    """Analyze user's music taste with AI and return verdict."""
    try:
        analysis_service = MusicAnalysisService(session)
        return await analysis_service.analyze_user_music_taste(current_user_id)
    except SpotifyAPIError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.get("/music/analysis/latest", response_model=MusicAnalysisResponse | None)
async def get_latest_analysis(
    session: AsyncSession = Depends(get_session),
    current_user_id: int = Depends(get_current_user_id),
) -> MusicAnalysisResponse | None:
    """Get user's most recent music analysis."""
    try:
        analysis_service = MusicAnalysisService(session)
        return await analysis_service.get_latest_analysis(current_user_id)
    except SpotifyAPIError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
