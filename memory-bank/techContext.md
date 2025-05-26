# Technical Context: unwrapped.fm

## Technology Stack

### Backend
- **Framework**: FastAPI (async support, automatic API docs, type hints)
- **Database**: PostgreSQL with SQLModel + SQLAlchemy (async)
- **Environment Management**: uv (modern Python package management)
- **Testing**: pytest with asyncio support and SQLAlchemy joining session isolation
- **Code Quality**: ruff (linting + formatting)
- **Authentication**: Spotify OAuth with JWT tokens
- **Architecture**: Domain-driven design with functional cohesion

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite (fast development and building)
- **Styling**: Tailwind CSS (rapid UI development)
- **Routing**: React Router
- **Testing**: Vitest + React Testing Library

### External APIs
- **Spotify Web API**: Music data retrieval, user authentication
- **OpenAI API**: AI-powered music taste analysis (Phase 4)

### Development Tools
- **Package Management**: uv (never use pip directly)
- **Database Isolation**: SQLAlchemy joining session pattern for testing
- **Version Control**: Git with conventional commits

## Modern Python Implementation

### Python Patterns Applied ✅
```python
# Modern union syntax (not Optional)
def verify_token(token: str) -> dict | None:
    pass

# Modern imports (not from typing)
from collections.abc import AsyncGenerator
from datetime import UTC, datetime, timedelta
from pydantic import Field, Column

# Modern datetime usage with timezone-awareness
expire = datetime.now(UTC) + timedelta(minutes=30)

# Timezone-aware database fields
created_at: datetime = Field(
    default_factory=lambda: datetime.now(UTC),
    sa_column=Column(DateTime(timezone=True))
)

# Pydantic v2 with ConfigDict
class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env")
```

### Timezone-Aware Implementation ✅ NEW!
```python
# All database models use timezone-aware datetime fields
class User(SQLModel, table=True):
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True))
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True))
    )
    token_expires_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )

# Service methods use modern datetime patterns
async def update_user_tokens(self, user_id: int, spotify_token: SpotifyToken) -> User | None:
    user.token_expires_at = datetime.now(UTC) + timedelta(seconds=spotify_token.expires_in)
    user.updated_at = datetime.now(UTC)
    return user

# Benefits achieved:
# - Zero deprecation warnings
# - Database timezone safety
# - Modern Python compliance
# - Consistent datetime handling
```

### Domain Architecture ✅
```
src/unwrapped/
├── core/          # Infrastructure Domain
│   ├── config.py     # Configuration management
│   ├── database.py   # Database connection & session management
│   ├── security.py   # JWT token utilities
│   ├── exceptions.py # Custom exception classes
│   └── dependencies.py # FastAPI dependency injection
├── auth/          # Authentication Domain
│   ├── models.py     # User, SpotifyToken data models
│   ├── service.py    # UserService business logic
│   ├── router.py     # Authentication API endpoints
│   └── spotify.py    # Spotify OAuth client
├── music/         # Music Domain (Phase 3 Ready)
│   ├── models.py     # Track, Artist, Album models
│   ├── service.py    # Music data business logic
│   ├── router.py     # Music API endpoints
│   ├── spotify.py    # Spotify music data client
│   ├── schemas.py    # Request/response schemas
│   └── utils.py      # Music data utilities
├── shared/        # Shared Utilities Domain
│   ├── api_client.py # Base HTTP client patterns
│   ├── pagination.py # Pagination utilities
│   └── validators.py # Common validation logic
└── main.py        # Application entry point
```

## Development Setup

### Python Environment
```bash
# All Python commands use uv
uv run python --version
uv run uvicorn src.unwrapped.main:app --reload
uv run pytest
uv run ruff check . && uv run ruff format .
```

### Dependencies Management

**CRITICAL: Use `uv add` for dependencies, never edit pyproject.toml directly**

```bash
# Add dependencies correctly
uv add "fastapi>=0.104.0"
uv add "python-jose[cryptography]"  # Note quotes for extras

# Dev dependencies
uv add --dev "pytest>=7.4.0"
```

```toml
[project]
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "sqlmodel>=0.0.14",
    "asyncpg>=0.29.0",
    "httpx>=0.25.0",
    "pydantic>=2.4.0",
    "pydantic-settings>=2.0.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-multipart>=0.0.6",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "pytest-cov>=4.1.0",
    "httpx>=0.25.0",
    "ruff>=0.1.0",
    "testcontainers>=3.7.0",
]
```

### Database Configuration
- **Primary DB**: PostgreSQL with async connections (asyncpg)
- **ORM**: SQLModel (Pydantic integration with SQLAlchemy)
- **Testing**: Perfect isolation using SQLAlchemy joining session pattern
- **Connection**: Async sessions with proper transaction management

## Testing Strategy ✅

### Database Isolation Pattern (Mandatory)
```python
@pytest_asyncio.fixture
async def async_session(async_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a new async session for each test with proper transaction rollback.

    This implements the SQLAlchemy joining session pattern for test isolation:
    https://docs.sqlalchemy.org/en/20/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites
    """
    async with async_engine.connect() as connection:
        # Begin an external transaction
        trans = await connection.begin()

        # Create session bound to this connection with savepoint mode
        session = AsyncSession(
            bind=connection,
            join_transaction_mode="create_savepoint"
        )

        try:
            yield session
        finally:
            await session.close()
            # Rollback the external transaction - this undoes all changes
            await trans.rollback()
```

### Async Test Client Pattern (Mandatory)
```python
@pytest_asyncio.fixture
async def client(async_session) -> AsyncClient:
    """Create async test client with database override."""
    def override_get_session():
        yield async_session

    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        yield client

    app.dependency_overrides.clear()
```

### Test Requirements ✅
- **All test methods**: Must be `async def` and marked with `@pytest.mark.asyncio`
- **Client calls**: Must use `await client.get(...)` never `client.get(...)`
- **Database operations**: Always async with proper session management
- **Test organization**: Domain-specific test structure mirrors source organization

## Technical Constraints

### API Limitations
- **Spotify API**: Rate limits (100 requests/minute), token expiration, data access scope
- **OpenAI API**: Cost per request, rate limits, response time (Phase 4)
- **Free Tier Considerations**: Usage limits for development/demo

### Performance Requirements
- Handle music libraries of various sizes (100 - 50,000+ tracks)
- Efficient data processing and aggregation
- Async operations for external API calls
- Connection pooling for database

### Security Requirements
- Secure OAuth token handling
- Environment variable protection
- Input validation and sanitization
- Rate limiting protection

## Architecture Decisions

### Domain-Driven Design Benefits ✅
1. **🎯 Single Purpose**: Each module has one well-defined responsibility
2. **📦 Domain Boundaries**: Clear separation between auth, music, core, shared
3. **🔄 Scalability**: Easy to add new domains without affecting existing code
4. **🧪 Test Organization**: Test structure mirrors source organization
5. **🔍 Maintainability**: Easy to locate and modify specific functionality

### Key Patterns ✅
- **Domain Isolation**: Clear boundaries prevent cross-domain dependencies
- **Functional Cohesion**: Highest level of cohesion achieved
- **Service Layer**: Domain-specific business logic separation
- **Dependency Injection**: FastAPI's DI system respecting domain boundaries
- **Modern Python**: Union syntax, modern imports, UTC datetime

### Database Design (Domain-Organized)
```python
# auth/models.py - Authentication domain
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    spotify_id: str = Field(unique=True, index=True)
    display_name: str
    email: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    # Spotify OAuth tokens
    access_token: str | None = None
    refresh_token: str | None = None
    token_expires_at: datetime | None = None

class SpotifyToken(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str

# music/models.py - Music domain (Phase 3 Ready)
class Track(SQLModel, table=True):
    id: str = Field(primary_key=True)  # Spotify track ID
    name: str
    artist_id: str = Field(foreign_key="artist.id")
    album_id: str = Field(foreign_key="album.id")
    duration_ms: int
    popularity: int
    audio_features: dict = Field(sa_column=Column(JSON))

class Artist(SQLModel, table=True):
    id: str = Field(primary_key=True)  # Spotify artist ID
    name: str
    genres: list[str] = Field(sa_column=Column(JSON))
    popularity: int
    followers: int

class Album(SQLModel, table=True):
    id: str = Field(primary_key=True)  # Spotify album ID
    name: str
    artist_id: str = Field(foreign_key="artist.id")
    release_date: str
    total_tracks: int
```

## Configuration Management

### Environment Variables (127.0.0.1 Configuration ✅ STANDARDIZED)

**DECISION: Use 127.0.0.1 Consistently for Development**
- **Rationale**: Better cross-platform compatibility, avoids IPv6/IPv4 conflicts, more predictable SSL behavior
- **Applied**: All URLs standardized to 127.0.0.1 for development environment

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/unwrapped
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/unwrapped_test

# JWT Configuration
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Spotify OAuth (127.0.0.1 Configuration - CRITICAL for OAuth success)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://127.0.0.1:8443/api/v1/auth/callback

# Application URLs (127.0.0.1 Configuration - STANDARDIZED)
FRONTEND_URL=https://127.0.0.1:5174
BACKEND_URL=https://127.0.0.1:8443

# OpenAI (for future use)
OPENAI_API_KEY=your_openai_api_key
```

**⚠️ CRITICAL: Spotify App Dashboard Configuration Required**
The Spotify app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) must have this exact redirect URI configured:
```
https://127.0.0.1:8443/api/v1/auth/callback
```

### HTTPS Development Setup ✅ Complete

#### SSL Certificates (Localhost Certificate for 127.0.0.1)
- **Location**: `backend/certs/localhost.{crt,key}`
- **Generation**: OpenSSL self-signed for localhost (works with 127.0.0.1)
- **Usage**: Shared between backend and frontend
- **Command**: `openssl req -x509 -newkey rsa:4096 -keyout localhost.key -out localhost.crt -days 365 -nodes -subj "/C=US/ST=Local/L=Local/O=unwrapped/CN=localhost"`

#### Backend HTTPS (127.0.0.1:8443) ✅
```python
# uvicorn with SSL - 127.0.0.1 accessible
uvicorn src.unwrapped.main:app --reload --host 0.0.0.0 --port 8443 \
  --ssl-keyfile certs/localhost.key --ssl-certfile certs/localhost.crt
```

#### Frontend HTTPS (127.0.0.1:5174) ✅
```typescript
// vite.config.ts - Updated to ensure 127.0.0.1 compatibility
export default defineConfig({
  server: {
    https: {
      key: '../backend/certs/localhost.key',
      cert: '../backend/certs/localhost.crt',
    },
    port: 5174,
    host: true  // Enables 0.0.0.0 binding for 127.0.0.1 access
  },
})
```

## Code Quality Standards ✅

### Modern Python Compliance
- ✅ **Union Syntax**: `str | None` instead of `Optional[str]`
- ✅ **Modern Imports**: `collections.abc.AsyncGenerator`, `datetime.UTC`
- ✅ **Timezone-Aware**: All datetime fields use `datetime.now(UTC)` and `DateTime(timezone=True)`
- ✅ **Pydantic v2**: `ConfigDict` instead of class-based Config
- ✅ **Exception Chaining**: `raise HTTPException(...) from e`
- ✅ **Async Patterns**: Proper async/await throughout

### Testing Excellence
- ✅ **Database Isolation**: SQLAlchemy joining session pattern (mandatory)
- ✅ **73% Coverage**: Excellent test coverage maintained
- ✅ **Domain Organization**: Tests mirror source structure
- ✅ **Async Testing**: httpx.AsyncClient for all endpoint tests
- ✅ **Zero Flaky Tests**: Perfect transaction rollback isolation

### Development Workflow
```bash
# Backend workflow (domain-organized)
cd backend/
uv run uvicorn src.unwrapped.main:app --reload  # ✅ Auth working
uv run pytest                                     # ✅ 45/45 passing
uv run ruff check . && uv run ruff format .      # ✅ Zero errors

# Frontend workflow
cd frontend/
npm run dev    # ✅ HTTPS working
npm run build  # ✅ Production builds
```

## Architecture Quality Assurance ✅

### Complexity Measurement Tools
```bash
# Measure cyclomatic complexity across codebase
uv run radon cc src/unwrapped/ --min B --show-complexity

# Track complexity improvements over time
uv run radon cc src/unwrapped/music/ --min B  # Focus on specific modules

# Results achieved in Phase 2:
# BEFORE: MusicAnalysisService._fallback_analysis - D (22)
# AFTER: Decomposed services - Multiple B-level services (6-8 complexity)
```

### Service Decomposition Principles ✅
```python
# Applied principles from architecture remediation:

1. Single Responsibility Principle
   - Each service has one clear purpose
   - Easy to test and maintain in isolation

2. Dependency Injection
   - Clear dependency hierarchy
   - Mockable for testing
   - Follows dependency inversion principle

3. God Object Elimination
   - Break down large classes (>200 lines)
   - Extract focused services
   - Maintain facade for backward compatibility

4. Complexity Isolation
   - Keep high complexity (D-level) in focused services
   - Extract medium complexity (B-level) to dedicated services
   - Optimize low complexity (A-level) in place
```

### Test Pattern Updates for Decomposed Architecture ✅
```python
# Key learning: Service decomposition requires test pattern updates

# Challenge: Multiple services require multiple mocks
def test_music_analysis_with_decomposed_services(mock_spotify, mock_ai):
    with patch("service1.external_dependency", mock_spotify), \
         patch("service2.external_dependency", mock_spotify), \
         patch("service3.ai_dependency") as mock_ai_class:

        # Configure async mocks properly
        async def mock_ai_method(data):
            return {"test": "result"}
        mock_ai_class.return_value.method = mock_ai_method

# Solution: Create test utilities for common mock patterns
class ServiceMockHelper:
    @staticmethod
    def mock_spotify_services():
        return [
            patch("service.data_collector.spotify_client"),
            patch("service.token_service.spotify_client")
        ]
```

### Architecture Evolution Patterns ✅
```markdown
Successful Pattern: Incremental Decomposition
1. Measure complexity baseline
2. Identify God objects (>200 lines, D-level complexity)
3. Extract high-cohesion services
4. Update dependency injection
5. Refactor tests for new architecture
6. Validate with complexity measurement
7. Ensure zero regressions

Key Insight: Maintain external API compatibility during decomposition
- Keep existing service as facade
- Gradually delegate to focused services
- Update tests incrementally
- Preserve all existing functionality
```
