# System Patterns: unwrapped.fm

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │◄──►│   FastAPI       │◄──►│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Spotify API   │    │   OpenAI API    │
│   (Music Data)  │    │   (AI Analysis) │
└─────────────────┘    └─────────────────┘
```

### Domain-Driven Architecture (Implemented)

#### Backend Domain Structure
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

### Component Relationships

#### Frontend Components
```
App
├── AuthProvider (Spotify OAuth context)
├── Router
│   ├── LandingPage
│   ├── AuthCallback
│   ├── AnalysisPage
│   │   ├── LoadingState
│   │   └── ResultsDisplay
│   └── SharedResultsPage
└── ApiClient (HTTP client service)
```

#### Backend Domain Services (Updated)
```
FastAPI App
├── API Routes (/api/v1/)
│   ├── auth/ (Authentication domain)
│   ├── music/ (Music domain - Phase 3)
│   ├── analysis/ (Analysis domain - Phase 4)
│   └── share/ (Sharing domain - Phase 5)
├── Domain Services
│   ├── auth/
│   │   ├── UserService (user management)
│   │   └── SpotifyAuthClient (OAuth flow)
│   ├── music/ (Phase 3)
│   │   ├── MusicService (business logic)
│   │   └── SpotifyMusicClient (data retrieval)
│   └── shared/
│       └── BaseApiClient (common patterns)
├── Data Models (SQLModel)
│   ├── auth/models.py
│   │   ├── User
│   │   └── SpotifyToken
│   └── music/models.py (Phase 3)
│       ├── Track
│       ├── Artist
│       └── Album
└── Core Infrastructure
    ├── Database (async PostgreSQL)
    ├── Security (JWT utilities)
    ├── Config (Pydantic v2)
    └── Dependencies (DI patterns)
```

## Design Patterns

### Domain-Driven Design Patterns (Implemented)

#### Functional Cohesion
```python
# Each domain module has a single, well-defined purpose

# auth/service.py - User management only
class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_user(self, user_create: UserCreate) -> User:
        # Pure user creation logic
        pass

    async def update_user_tokens(self, user_id: int, token: SpotifyToken) -> User:
        # Pure token update logic
        pass

# core/security.py - Security utilities only
def create_user_token(user_id: int) -> str:
    # Pure JWT token creation
    pass

def verify_token(token: str) -> dict | None:
    # Pure token verification
    pass
```

#### Domain Isolation
```python
# Clear boundaries prevent cross-domain dependencies

# auth/router.py imports only from auth and core
from ..core import get_session, create_user_token
from .service import UserService
from .spotify import spotify_auth_client

# music/router.py (Phase 3) will import only from music and core
# from ..core import get_session, get_current_user_id
# from .service import MusicService
```

#### Service Layer Pattern (Enhanced)
```python
# Domain-specific services with single responsibilities

# auth/service.py
class UserService:
    """Handles all user-related business logic."""

    async def create_or_update_user_from_spotify(
        self, spotify_user: dict, spotify_token: SpotifyToken
    ) -> User:
        # Orchestrates user creation/update with Spotify data
        pass

# music/service.py (Phase 3 Ready)
class MusicService:
    """Handles all music data business logic."""

    async def get_user_music_analysis(self, user_id: int) -> MusicAnalysis:
        # Orchestrates music data retrieval and processing
        pass
```

### Backend Patterns

#### Modern Python Patterns (Implemented)
```python
# Modern union syntax
def verify_token(token: str) -> dict | None:
    pass

# Modern imports
from collections.abc import AsyncGenerator
from datetime import UTC, datetime, timedelta

# Modern datetime usage with timezone-awareness
expire = datetime.now(UTC) + timedelta(minutes=30)

# Timezone-aware database fields
created_at: datetime = Field(
    default_factory=lambda: datetime.now(UTC),
    sa_column=Column(DateTime(timezone=True))
)
```

#### Timezone-Aware Database Patterns (Implemented) ✅ NEW!
```python
# auth/models.py - Timezone-aware user timestamps
class User(UserBase, table=True):
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

# music/models.py - Timezone-aware music data timestamps
class Track(SQLModel, table=True):
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True))
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True))
    )

# Service layer timezone-aware operations
class UserService:
    async def update_user(self, user_id: int, user_data: UserUpdate) -> User | None:
        # ... existing code ...
        user.updated_at = datetime.now(UTC)  # Modern timezone-aware
        await self.session.commit()
        return user
```

#### Dependency Injection (Domain-Aware)
```python
# FastAPI DI respects domain boundaries
@router.get("/me", response_model=UserRead)
async def get_current_user(
    current_user_id: int = Depends(get_current_user_id),  # From core
    session: AsyncSession = Depends(get_session),        # From core
) -> UserRead:
    user_service = UserService(session)  # Auth domain service
    user = await user_service.get_user_by_id(current_user_id)
    return UserRead.from_orm(user)
```

#### Exception Handling with Domain Context
```python
# Core domain provides base exceptions
class SpotifyAPIError(Exception):
    """Custom exception for Spotify API errors."""
    pass

# Auth domain uses core exceptions appropriately
async def exchange_code_for_token(self, code: str) -> SpotifyToken:
    try:
        # Spotify API call
        pass
    except Exception as e:
        raise SpotifyAPIError(f"Failed to exchange code: {e}") from e
```

### Testing Patterns (Domain-Organized)

#### Database Isolation (Maintained)
```python
@pytest_asyncio.fixture
async def async_session(async_engine) -> AsyncGenerator[AsyncSession, None]:
    """Perfect database isolation using SQLAlchemy joining session pattern."""
    async with async_engine.connect() as connection:
        trans = await connection.begin()
        session = AsyncSession(
            bind=connection,
            join_transaction_mode="create_savepoint"
        )
        try:
            yield session
        finally:
            await session.close()
            await trans.rollback()
```

#### Domain-Specific Testing
```
tests/
├── core/           # Infrastructure tests
│   ├── test_security.py
│   ├── test_database.py
│   └── test_config.py
├── auth/           # Authentication domain tests
│   ├── test_auth_service.py
│   ├── test_auth_router.py
│   └── test_spotify_auth.py
├── music/          # Music domain tests (Phase 3)
│   ├── test_music_service.py
│   └── test_music_router.py
└── shared/         # Shared utilities tests
    └── test_validators.py
```

### Frontend Patterns (Ready for Enhancement)

#### Context API for State Management
```typescript
// Authentication context
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // OAuth flow management
  const loginWithSpotify = async () => { /* ... */ };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loginWithSpotify }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Data Flow Patterns

### Authentication Flow (Domain-Organized)
```
1. User clicks "Connect with Spotify"
2. Frontend calls auth domain `/api/v1/auth/login` endpoint
3. auth/router.py calls auth/spotify.py to generate OAuth URL
4. Frontend redirects to Spotify OAuth authorization
5. Spotify redirects back to auth domain `/api/v1/auth/callback`
6. auth/router.py orchestrates:
   - auth/spotify.py exchanges code for tokens
   - auth/spotify.py retrieves user profile
   - auth/service.py creates/updates user in database
   - core/security.py generates JWT token
7. Backend redirects to frontend with JWT token
8. Frontend extracts token and updates authentication state
```

### Music Analysis Flow (Phase 3 Ready)
```
1. Authenticated user requests music analysis
2. Frontend calls music domain `/api/v1/music/analysis` endpoint
3. music/router.py orchestrates:
   - core/dependencies.py validates JWT token
   - music/service.py coordinates data retrieval
   - music/spotify.py fetches music data from Spotify
   - music/service.py processes and analyzes data
   - music/models.py stores analysis results
4. Frontend displays analysis results
```

## Benefits of Domain Architecture

### Functional Cohesion Achieved ✅
1. **🎯 Single Purpose**: Each module has one well-defined responsibility
2. **📦 Domain Boundaries**: Clear separation between auth, music, core, shared
3. **🔄 Scalability**: Easy to add new domains without affecting existing code
4. **🧪 Test Organization**: Test structure mirrors source organization
5. **🔍 Maintainability**: Easy to locate and modify specific functionality

### Development Benefits ✅
- **Domain Isolation**: Music features won't interfere with auth code
- **Clear Structure**: Easy to locate and organize domain-specific code
- **Team Scalability**: Different developers can work on different domains
- **Testing Clarity**: Domain-specific tests are focused and isolated
- **Code Navigation**: Logical organization improves development speed

### Quality Assurance ✅
- **45/45 Tests Passing**: All tests updated for new domain structure
- **73% Test Coverage**: Excellent coverage maintained through refactoring
- **Zero Linting Errors**: Modern Python patterns throughout
- **Perfect Database Isolation**: SQLAlchemy joining session pattern preserved
