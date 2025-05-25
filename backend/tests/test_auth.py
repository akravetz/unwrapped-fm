"""Tests for authentication and security functions."""

from datetime import UTC, datetime, timedelta
from unittest.mock import patch

import pytest
from fastapi import HTTPException
from jose import jwt

from src.unwrapped.core.config import settings
from src.unwrapped.core.dependencies import get_current_user_id
from src.unwrapped.core.security import (
    create_access_token,
    create_user_token,
    verify_token,
)


class TestAuthFunctions:
    """Test cases for authentication functions."""

    def test_create_user_token(self, test_user):
        """Test creating a JWT token for a user."""
        token = create_user_token(test_user.id)

        assert token is not None
        assert isinstance(token, str)

        # Decode the token to verify its contents
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        assert payload["sub"] == str(test_user.id)
        assert "exp" in payload

    def test_create_access_token_custom_expires(self, test_user):
        """Test creating an access token with custom expiration."""
        custom_expires = timedelta(hours=2)
        token = create_access_token(
            {"sub": str(test_user.id)}, expires_delta=custom_expires
        )

        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )

        # Check that expiration is approximately 2 hours from now
        exp_time = datetime.fromtimestamp(payload["exp"], tz=UTC)
        expected_time = datetime.now(UTC) + custom_expires
        time_diff = abs((exp_time - expected_time).total_seconds())
        assert time_diff < 60  # Within 1 minute tolerance

    def test_verify_token_valid(self, valid_jwt_token):
        """Test verifying a valid JWT token."""
        payload = verify_token(valid_jwt_token)

        assert payload is not None
        assert "sub" in payload
        assert "exp" in payload

    def test_verify_token_invalid_signature(self):
        """Test verifying a token with invalid signature."""
        # Create a token with a different secret
        fake_token = jwt.encode(
            {"sub": "123", "exp": datetime.now(UTC) + timedelta(hours=1)},
            "wrong_secret",
            algorithm=settings.algorithm,
        )

        payload = verify_token(fake_token)
        assert payload is None

    def test_verify_token_expired(self):
        """Test verifying an expired token."""
        # Create an expired token
        expired_payload = {
            "sub": "123",
            "exp": datetime.now(UTC) - timedelta(hours=1),  # Expired 1 hour ago
        }
        expired_token = jwt.encode(
            expired_payload, settings.secret_key, algorithm=settings.algorithm
        )

        payload = verify_token(expired_token)
        assert payload is None

    def test_verify_token_invalid_format(self):
        """Test verifying a malformed token."""
        payload = verify_token("invalid.token.format")
        assert payload is None

    def test_verify_token_none_input(self):
        """Test verifying None token."""
        payload = verify_token(None)
        assert payload is None

    def test_verify_token_empty_string(self):
        """Test verifying empty string token."""
        payload = verify_token("")
        assert payload is None

    @pytest.mark.asyncio
    async def test_get_current_user_id_valid_token(self, valid_jwt_token, test_user):
        """Test getting current user ID from valid token."""
        from fastapi.security import HTTPAuthorizationCredentials

        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=valid_jwt_token
        )
        user_id = get_current_user_id(credentials)

        assert user_id == test_user.id

    @pytest.mark.asyncio
    async def test_get_current_user_id_invalid_token(self):
        """Test getting current user ID with invalid token."""
        from fastapi.security import HTTPAuthorizationCredentials

        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="invalid_token"
        )

        with pytest.raises(HTTPException) as exc_info:
            get_current_user_id(credentials)

        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_id_missing_sub(self):
        """Test getting current user ID with token missing sub claim."""
        from fastapi.security import HTTPAuthorizationCredentials

        # Create token without 'sub' claim
        invalid_payload = {"exp": datetime.now(UTC) + timedelta(hours=1)}
        invalid_token = jwt.encode(
            invalid_payload, settings.secret_key, algorithm=settings.algorithm
        )

        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=invalid_token
        )

        with pytest.raises(HTTPException) as exc_info:
            get_current_user_id(credentials)

        assert exc_info.value.status_code == 401

    def test_create_access_token_default_expiry(self):
        """Test creating access token with default expiry."""
        token = create_access_token({"sub": "123"})

        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )

        # Should have default expiration - check that it's reasonable (not too far off)
        exp_time = datetime.fromtimestamp(payload["exp"], tz=UTC)
        now = datetime.now(UTC)
        time_diff = (exp_time - now).total_seconds()

        # Should be close to the configured expiration time (within reasonable tolerance)
        expected_seconds = settings.access_token_expire_minutes * 60
        assert abs(time_diff - expected_seconds) < 120  # Within 2 minutes tolerance

    def test_create_access_token_missing_secret(self):
        """Test token creation when secret is not configured."""
        # This test verifies that jose properly handles empty/None secrets by raising an error
        from jose.exceptions import JWSError

        with patch("src.unwrapped.core.security.settings") as mock_settings:
            mock_settings.secret_key = None
            mock_settings.algorithm = "HS256"
            mock_settings.access_token_expire_minutes = 30

            # Should raise an error when trying to create token with None secret
            with pytest.raises(JWSError):
                create_access_token({"sub": "123"})
