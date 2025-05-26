"""Music analysis API router for AI-powered music taste analysis."""

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_session
from ..core.dependencies import get_current_user_id
from ..core.exceptions import SpotifyAPIError
from .analysis_service import MusicAnalysisService
from .models import AnalysisStatusResponse, BeginAnalysisResponse, MusicAnalysisResponse

router = APIRouter(tags=["music-analysis"])


# New background task endpoints


@router.post("/music/analysis/begin", response_model=BeginAnalysisResponse)
async def begin_analysis(
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user_id: int = Depends(get_current_user_id),
) -> BeginAnalysisResponse:
    """Begin music analysis for user. Returns existing analysis if found, creates new if none exists."""
    try:
        analysis_service = MusicAnalysisService(session)
        return await analysis_service.begin_analysis(current_user_id, background_tasks)
    except SpotifyAPIError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.get("/music/analysis/status", response_model=AnalysisStatusResponse)
async def poll_analysis(
    session: AsyncSession = Depends(get_session),
    current_user_id: int = Depends(get_current_user_id),
) -> AnalysisStatusResponse:
    """Get current status of user's music analysis."""
    try:
        analysis_service = MusicAnalysisService(session)
        return await analysis_service.poll_analysis(current_user_id)
    except HTTPException:
        raise  # Re-raise HTTP exceptions from service
    except SpotifyAPIError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.get("/music/analysis/result", response_model=MusicAnalysisResponse)
async def get_analysis(
    session: AsyncSession = Depends(get_session),
    current_user_id: int = Depends(get_current_user_id),
) -> MusicAnalysisResponse:
    """Get completed music analysis result for user."""
    try:
        analysis_service = MusicAnalysisService(session)
        return await analysis_service.get_analysis(current_user_id)
    except HTTPException:
        raise  # Re-raise HTTP exceptions from service
    except SpotifyAPIError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


# Existing endpoints (for backward compatibility)


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
