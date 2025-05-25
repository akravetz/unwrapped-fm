"""Atlas migration utilities for testing."""

import subprocess
from pathlib import Path


def apply_atlas_migrations(db_url: str) -> None:
    """Apply Atlas migrations to the given database URL.

    Args:
        db_url: PostgreSQL connection URL for the test database

    Raises:
        RuntimeError: If migration application fails
    """
    try:
        # Run Atlas migrate apply with the test database URL
        result = subprocess.run(
            ["atlas", "migrate", "apply", "--env", "test", "--url", db_url],
            cwd=Path(__file__).parent.parent.parent,  # Run from backend directory
            check=False,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            error_msg = f"Atlas migration failed with exit code {result.returncode}"
            if result.stderr:
                error_msg += f"\nStderr: {result.stderr}"
            if result.stdout:
                error_msg += f"\nStdout: {result.stdout}"
            raise RuntimeError(error_msg)

    except FileNotFoundError as e:
        raise RuntimeError(
            "Atlas CLI not found. Please install Atlas CLI first. "
            "Visit: https://atlasgo.io/getting-started#installation"
        ) from e


def check_atlas_available() -> bool:
    """Check if Atlas CLI is available.

    Returns:
        True if Atlas CLI is available, False otherwise
    """
    try:
        result = subprocess.run(
            ["atlas", "version"],
            capture_output=True,
            check=False,
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False
