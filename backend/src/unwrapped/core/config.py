"""Application configuration settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str = "postgresql://postgres:postgres@localhost:5432/unwrapped"
    secret_key: str = "development-secret-key-change-in-production-12345"
    algorithm: str = "HS256"
    port: int = 8443
    access_token_expire_minutes: int = 30
    spotify_client_id: str = "development_client_id"
    spotify_client_secret: str = "development_client_secret"
    spotify_redirect_uri: str = "https://127.0.0.1:8443/api/v1/auth/callback"
    frontend_url: str = "https://127.0.0.1:5174"

    # AI Configuration (DeepSeek)
    deepseek_api_key: str = "your_deepseek_api_key_here"
    deepseek_base_url: str = "https://api.deepseek.com"

    # Production domain support
    environment: str = "development"  # development, staging, production
    production_domain: str = "unwrapped.fm"

    @property
    def cors_origins(self) -> list[str]:
        """Get CORS origins based on environment."""
        if self.environment == "production":
            return [
                f"https://{self.production_domain}",
                f"https://www.{self.production_domain}",
                # Keep localhost for development testing
                "https://localhost:5174",
                "https://127.0.0.1:5174",
            ]
        else:
            return [
                "https://localhost:5174",
                "https://127.0.0.1:5174",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
            ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
