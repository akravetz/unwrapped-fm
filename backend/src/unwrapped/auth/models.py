"""Authentication and user models."""

from datetime import UTC, datetime

from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    """Base user model with shared fields."""

    spotify_id: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    display_name: str | None = None
    country: str | None = None
    image_url: str | None = None


class User(UserBase, table=True):
    """User database model."""

    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True)),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True)),
    )
    is_active: bool = Field(default=True)

    # Spotify OAuth tokens
    access_token: str | None = None
    refresh_token: str | None = None
    token_expires_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True))
    )


class UserCreate(UserBase):
    """User creation model."""

    pass


class UserRead(UserBase):
    """User read model (public)."""

    id: int
    created_at: datetime
    is_active: bool


class UserUpdate(SQLModel):
    """User update model."""

    display_name: str | None = None
    country: str | None = None
    image_url: str | None = None


class SpotifyToken(SQLModel):
    """Spotify token response model."""

    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "Bearer"
    scope: str | None = None


class AuthResponse(SQLModel):
    """Authentication response model."""

    access_token: str
    token_type: str = "Bearer"
    user: UserRead
