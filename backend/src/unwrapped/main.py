"""Main FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import auth_router
from .core.config import settings
from .music.analyze_router import router as analyze_router
from .music.public_router import router as public_router

app = FastAPI(
    title="unwrapped.fm",
    description="AI-powered music taste analysis - get your Spotify listening habits brutally judged",
    version="0.1.0",
)

# Configure CORS with dynamic origins based on environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(analyze_router, prefix="/api/v1")
app.include_router(public_router, prefix="/api/v1")


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint for health check."""
    return {"message": "unwrapped.fm API is running!"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}
