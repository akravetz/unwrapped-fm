"""Music domain models for AI analysis results."""

from datetime import UTC, datetime

from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


class MusicAnalysisResult(SQLModel, table=True):
    """AI music analysis results for user's music taste."""

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")

    # AI Analysis Results
    rating_text: str  # e.g., "HIPSTER TRASH"
    rating_description: str  # Full AI analysis text
    x_axis_pos: float  # Position on x-axis of quadrant graph (-1.0 to 1.0)
    y_axis_pos: float  # Position on y-axis of quadrant graph (-1.0 to 1.0)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True)),
    )


class MusicAnalysisResponse(SQLModel):
    """Music analysis API response model."""

    rating_text: str
    rating_description: str
    x_axis_pos: float
    y_axis_pos: float
    analyzed_at: datetime
