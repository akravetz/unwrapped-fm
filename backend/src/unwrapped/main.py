"""Main FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import auth_router
from .music.analyze_router import router as analyze_router

app = FastAPI(
    title="unwrapped.fm",
    description="AI-powered music taste analysis - get your Spotify listening habits brutally judged",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://localhost:5174",
        "https://127.0.0.1:5174",
    ],  # Vite frontend HTTPS URL (actual port)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(analyze_router, prefix="/api/v1")


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint for health check."""
    return {"message": "unwrapped.fm API is running!"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8443,
        reload=True,
        ssl_keyfile="certs/localhost.key",
        ssl_certfile="certs/localhost.crt",
    )
