"""Background task handlers for music analysis processing."""

from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from ..core.logging import get_logger
from .ai_client import MusicAnalysisAI
from .models import AnalysisStatus, MusicAnalysisResult
from .sharing import generate_unique_share_token
from .spotify_data_collector import SpotifyDataCollector
from .token_refresh_service import TokenRefreshService

logger = get_logger(__name__)


async def process_music_analysis_task(
    analysis_id: int, user_id: int, session: AsyncSession
) -> None:
    """
    Background task to process music analysis.

    Args:
        analysis_id: ID of the analysis record to process
        user_id: ID of the user requesting analysis
        session: Database session
    """
    try:
        # Get the analysis record
        stmt = select(MusicAnalysisResult).where(MusicAnalysisResult.id == analysis_id)
        result = await session.execute(stmt)
        analysis = result.scalar_one_or_none()

        if not analysis:
            logger.error(f"Analysis record {analysis_id} not found")
            return

        # Update status to processing
        analysis.status = AnalysisStatus.PROCESSING
        analysis.started_at = datetime.now(UTC)
        await session.commit()

        logger.info(
            f"Starting music analysis for user {user_id}, analysis {analysis_id}"
        )

        # Initialize services for analysis
        token_service = TokenRefreshService(session)
        data_collector = SpotifyDataCollector(token_service)
        ai_client = MusicAnalysisAI()

        # Step 1: Fetch music data from Spotify
        music_data = await data_collector.fetch_user_music_data(user_id)

        # Step 2: Analyze with AI (using the same logic as AnalysisCoordinator)
        analysis_result = await _analyze_music_with_ai(ai_client, music_data)

        # Step 3: Generate share token
        share_token = await generate_unique_share_token(session)

        # Step 4: Update the analysis record with results
        analysis.rating_text = analysis_result["rating_text"]
        analysis.rating_description = analysis_result["rating_description"]
        analysis.x_axis_pos = analysis_result["x_axis_pos"]
        analysis.y_axis_pos = analysis_result["y_axis_pos"]
        analysis.share_token = share_token
        analysis.status = AnalysisStatus.COMPLETED
        analysis.completed_at = datetime.now(UTC)
        analysis.error_message = None  # Clear any previous error

        await session.commit()

        logger.info(
            f"Music analysis completed successfully for user {user_id}, analysis {analysis_id}",
            extra={
                "user_id": user_id,
                "analysis_id": analysis_id,
                "share_token": share_token,
            },
        )

    except Exception as e:
        logger.error(
            f"Music analysis failed for user {user_id}, analysis {analysis_id}: {e}",
            extra={
                "user_id": user_id,
                "analysis_id": analysis_id,
                "error": str(e),
            },
        )

        try:
            # Update status to failed
            if analysis:
                analysis.status = AnalysisStatus.FAILED
                analysis.error_message = str(e)
                analysis.completed_at = datetime.now(UTC)
                await session.commit()
        except Exception as commit_error:
            logger.error(f"Failed to update analysis status to failed: {commit_error}")


async def _analyze_music_with_ai(ai_client: MusicAnalysisAI, music_data: dict) -> dict:
    """Analyze music data with AI to generate taste profile."""
    # Check if we have any music data at all
    has_any_data = False
    for time_range in ["short_term", "medium_term", "long_term"]:
        if music_data.get(f"top_tracks_{time_range}", {}).get("items"):
            has_any_data = True
            break

    if not has_any_data and not music_data.get("recently_played", {}).get("items"):
        # No music data available - return a default analysis
        return {
            "rating_text": "MYSTERIOUS LISTENER",
            "rating_description": "Your music taste is so unique that even Spotify doesn't know what to make of it. Either you're incredibly private about your listening habits, or you're the type of person who listens to music on vinyl exclusively. We respect the mystery.",
            "x_axis_pos": 0.0,
            "y_axis_pos": 0.0,
        }

    try:
        # Try AI analysis first
        result = await ai_client.analyze_music_taste(music_data)
        logger.info("AI analysis completed successfully")
        return result
    except Exception as e:
        # If AI fails, fall back to enhanced mock analysis
        logger.warning(
            "AI analysis failed, using fallback analysis", extra={"error": str(e)}
        )
        return _fallback_analysis(music_data)


def _fallback_analysis(music_data: dict) -> dict:
    """Enhanced fallback analysis when AI is unavailable."""
    # Extract comprehensive stats for fallback analysis
    total_tracks = 0
    genres = set()
    avg_popularity = 0

    # Count tracks and extract genres from top artists
    for time_range in ["short_term", "medium_term", "long_term"]:
        tracks = music_data.get(f"top_tracks_{time_range}", {}).get("items", [])
        total_tracks += len(tracks)

        artists = music_data.get(f"top_artists_{time_range}", {}).get("items", [])
        for artist in artists:
            genres.update(artist.get("genres", []))

    # Calculate average popularity from tracks
    all_popularities = []
    for time_range in ["short_term", "medium_term", "long_term"]:
        tracks = music_data.get(f"top_tracks_{time_range}", {}).get("items", [])
        all_popularities.extend(track.get("popularity", 0) for track in tracks)

    if all_popularities:
        avg_popularity = sum(all_popularities) / len(all_popularities)

    # Calculate genre diversity
    genre_count = len(genres)

    # Enhanced fallback analysis logic
    if avg_popularity > 70:
        if "pop" in genres or "mainstream" in str(genres).lower():
            rating_text = "BASIC MAINSTREAM"
            x_pos = 0.7  # Mainstream
            y_pos = -0.3  # Slightly negative
            description = f"You're basically a walking Billboard Hot 100 playlist. Your music taste is so mainstream that Spotify's algorithm probably uses you as a baseline for 'popular music.' With an average track popularity of {avg_popularity:.0f}, you're the human equivalent of a radio station that only plays the hits."
        else:
            rating_text = "POPULAR TASTE"
            x_pos = 0.5
            y_pos = 0.2
            description = f"You like what's popular, but at least you have some variety. Your {avg_popularity:.0f} average popularity score suggests you're not completely hopeless, just... predictable. You're the person who discovers new music when it hits the top 40."
    elif avg_popularity < 30:
        if any(genre in ["experimental", "noise", "avant-garde"] for genre in genres):
            rating_text = "PRETENTIOUS HIPSTER"
            x_pos = -0.8  # Very alternative
            y_pos = -0.6  # Negative
            description = f"Oh look, someone who thinks music peaked in an abandoned warehouse in Berlin. Your average popularity of {avg_popularity:.0f} screams 'I liked them before they were cool' energy. You probably own vinyl records that sound like construction equipment and call it 'art.'"
        else:
            rating_text = "UNDERGROUND EXPLORER"
            x_pos = -0.5
            y_pos = 0.4
            description = f"You've got good taste in finding hidden gems with your {avg_popularity:.0f} average popularity. You're like a musical archaeologist, digging up artists that deserve more recognition. Respect for not following the crowd."
    else:
        if genre_count > 10:
            rating_text = "GENRE HOPPER"
            x_pos = 0.1
            y_pos = 0.8
            description = f"You listen to {genre_count} different genres like you're trying to collect them all. Your music taste has more variety than a buffet restaurant. Are you having an identity crisis or just really indecisive?"
        elif genre_count < 3:
            rating_text = "ONE-TRACK MIND"
            x_pos = -0.2
            y_pos = -0.4
            description = f"With only {genre_count} genres in your rotation, you've found your lane and you're sticking to it. You're either incredibly focused or incredibly boring. We're leaning towards the latter."
        else:
            rating_text = "BALANCED LISTENER"
            x_pos = 0.0
            y_pos = 0.1
            description = f"You listen to {genre_count} genres with {total_tracks} tracks tracked. You're remarkably... balanced. Not too mainstream, not too hipster. You're the musical equivalent of vanilla ice cream - perfectly fine, but where's the excitement?"

    return {
        "rating_text": rating_text,
        "rating_description": description,
        "x_axis_pos": x_pos,
        "y_axis_pos": y_pos,
    }
