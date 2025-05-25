"""Custom exceptions for the unwrapped.fm application."""

from fastapi import HTTPException, status


class UnwrappedFMException(HTTPException):
    """Base exception for unwrapped.fm application."""

    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=message)


class SpotifyAPIError(UnwrappedFMException):
    """Exception raised when Spotify API calls fail."""

    def __init__(
        self, message: str, status_code: int = status.HTTP_503_SERVICE_UNAVAILABLE
    ):
        super().__init__(message, status_code)


class AuthenticationError(UnwrappedFMException):
    """Exception raised when authentication fails."""

    def __init__(self, message: str, status_code: int = status.HTTP_401_UNAUTHORIZED):
        super().__init__(message, status_code)


class MusicDataError(UnwrappedFMException):
    """Exception raised when music data processing fails."""

    def __init__(
        self, message: str, status_code: int = status.HTTP_422_UNPROCESSABLE_ENTITY
    ):
        super().__init__(message, status_code)


class TokenExpiredError(AuthenticationError):
    """Token has expired and needs refresh."""

    def __init__(self, message: str = "Token has expired"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class RateLimitError(SpotifyAPIError):
    """Rate limit exceeded for external API."""

    def __init__(
        self, message: str = "Rate limit exceeded", retry_after: int | None = None
    ):
        self.retry_after = retry_after
        super().__init__(message, status.HTTP_429_TOO_MANY_REQUESTS)
