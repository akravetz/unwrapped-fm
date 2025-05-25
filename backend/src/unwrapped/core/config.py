"""Application configuration settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str = "postgresql://postgres:postgres@localhost:5432/unwrapped"
    test_database_url: str = (
        "postgresql://postgres:postgres@localhost:5432/unwrapped_test"
    )
    secret_key: str = "development-secret-key-change-in-production-12345"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    spotify_client_id: str = "development_client_id"
    spotify_client_secret: str = "development_client_secret"
    spotify_redirect_uri: str = "https://127.0.0.1:8443/api/v1/auth/callback"
    frontend_url: str = "https://127.0.0.1:5174"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
