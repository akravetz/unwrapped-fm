"""Tests for main application endpoints."""

from fastapi.testclient import TestClient

from src.unwrapped.main import app

client = TestClient(app)


def test_root_endpoint() -> None:
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "unwrapped.fm API is running!"}


def test_health_check() -> None:
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
