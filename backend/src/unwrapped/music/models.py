"""Music domain models for AI analysis results."""

from datetime import UTC, datetime
from enum import StrEnum

from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


class AnalysisStatus(StrEnum):
    """Status values for music analysis background tasks."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class MusicAnalysisResult(SQLModel, table=True):
    """AI music analysis results for user's music taste."""

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(
        foreign_key="user.id", unique=True
    )  # UNIQUE CONSTRAINT: one analysis per user

    # Status tracking for background tasks
    status: AnalysisStatus = Field(default=AnalysisStatus.PENDING)
    error_message: str | None = Field(default=None)

    # AI Analysis Results (nullable for pending state)
    rating_text: str | None = Field(default=None)  # e.g., "HIPSTER TRASH"
    rating_description: str | None = Field(default=None)  # Full AI analysis text
    x_axis_pos: float | None = Field(
        default=None
    )  # Position on x-axis of quadrant graph (-1.0 to 1.0)
    y_axis_pos: float | None = Field(
        default=None
    )  # Position on y-axis of quadrant graph (-1.0 to 1.0)

    # Sharing (generated only when completed)
    share_token: str | None = Field(
        default=None, unique=True, index=True
    )  # 15-character random string
    shared_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True)),
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True)),
    )
    started_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True)),
    )
    completed_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True)),
    )


class MusicAnalysisResponse(SQLModel):
    """Music analysis API response model."""

    rating_text: str
    rating_description: str
    x_axis_pos: float
    y_axis_pos: float
    share_token: str
    analyzed_at: datetime


class PublicAnalysisResponse(SQLModel):
    """Public analysis response model (no sensitive data)."""

    rating_text: str
    rating_description: str
    x_axis_pos: float
    y_axis_pos: float
    analyzed_at: datetime


class AnalysisStatusResponse(SQLModel):
    """Analysis status response for polling endpoint."""

    analysis_id: int
    status: AnalysisStatus
    error_message: str | None = None
    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None


class BeginAnalysisResponse(SQLModel):
    """Response for begin analysis endpoint."""

    analysis_id: int
    status: AnalysisStatus
