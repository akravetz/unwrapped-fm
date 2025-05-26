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

### Background Task Architecture (NEW) ✅

#### Background Processing Pattern
```python
# Status-driven background task pattern
class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

# Database model with status tracking
class MusicAnalysisResult(SQLModel, table=True):
    status: AnalysisStatus = Field(default=AnalysisStatus.PENDING)
    error_message: str | None = Field(default=None)
    started_at: datetime | None = Field(default=None)
    completed_at: datetime | None = Field(default=None)
    user_id: int = Field(foreign_key="user.id", unique=True)  # One per user
```

#### Background Task Service Pattern
```python
# Three-method pattern for background task management
class MusicAnalysisService:
    async def begin_analysis(self, user_id: int) -> MusicAnalysisResult:
        """Idempotent: Returns existing or creates new analysis"""

    async def poll_analysis(self, user_id: int) -> AnalysisStatusResponse:
        """Real-time status with timestamps"""

    async def get_analysis(self, user_id: int) -> MusicAnalysisResult:
        """Validates completed status and returns results"""

# Background task processing
async def process_music_analysis_task(analysis_id: int):
    """Runs actual analysis with proper error handling"""
```

#### API Endpoint Pattern
```python
# RESTful background task endpoints
@router.post("/analysis/begin", response_model=BeginAnalysisResponse)
async def begin_background_analysis(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    service: MusicAnalysisService = Depends(get_music_analysis_service)
) -> BeginAnalysisResponse:
    """Begin background analysis (idempotent)"""

@router.get("/analysis/status", response_model=AnalysisStatusResponse)
async def get_analysis_status(
    current_user: User = Depends(get_current_user),
    service: MusicAnalysisService = Depends(get_music_analysis_service)
) -> AnalysisStatusResponse:
    """Poll analysis status with timestamps"""

@router.get("/analysis/result", response_model=MusicAnalysisResponse)
async def get_analysis_result(
    current_user: User = Depends(get_current_user),
    service: MusicAnalysisService = Depends(get_music_analysis_service)
) -> MusicAnalysisResponse:
    """Get completed analysis results"""
```

#### Database Migration Pattern (Atlas)
```bash
# Atlas migration workflow
task db:migrate:diff add_background_task_support  # Generate migration
task db:migrate:apply                              # Apply migration

# Migration adds:
# - status tracking fields
# - unique constraint on user_id
# - nullable analysis fields for pending state
```

### Revolutionary UX Pattern: Direct Flow Architecture ✅

#### Smart Routing Pattern (Implemented)
```typescript
// Eliminates welcome/home screen with intelligent state-based routing
type AppState = 'login' | 'loading' | 'results';

const useSmartRouting = () => {
  const { isAuthenticated, user, latestAnalysis, analysisLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>('login');

  useEffect(() => {
    if (isAuthenticated && user && !analysisLoading) {
      if (latestAnalysis) {
        // Returning user with results → Direct to results
        setAppState('results');
      } else {
        // New user or no results → Start analysis
        setAppState('loading');
      }
    } else if (!isAuthenticated && !isLoading) {
      // Not authenticated → Show login
      setAppState('login');
    }
  }, [isAuthenticated, user, latestAnalysis, analysisLoading, isLoading]);

  return appState;
};
```

#### User Journey Patterns
```
NEW USER FLOW:
Visit → Login Screen → OAuth → Loading Screen → Results Screen
                                     ↓
                              (Real Analysis)

RETURNING USER FLOW:
Visit → Auto-Auth Check → Results Screen (Direct)
                              ↓
                    (Has Existing Analysis)

ANALYZE AGAIN FLOW:
Results Screen → "Analyze Again" → Loading Screen → Updated Results

BACKGROUND TASK FLOW:
Begin Analysis → Status Polling → Result Retrieval
      ↓              ↓               ↓
   Idempotent    Real-time      Validated
   Operation     Updates        Completion
```

### Domain-Driven Architecture (Enhanced)

#### Frontend Domain Structure (Enhanced)
```
frontend/src/
├── domains/
│   ├── authentication/     # Enhanced with analysis state management
│   │   ├── components/     # LoginButton
│   │   ├── context/        # AuthContext with analysis tracking
│   │   │   └── AuthContext.tsx  # Enhanced with latestAnalysis state
│   │   ├── types/          # Enhanced with MusicAnalysisResponse
│   │   └── index.ts        # Clean exports
│   ├── music-analysis/     # Real analysis integration
│   │   ├── components/     # LoadingScreen with real API calls
│   │   │   └── LoadingScreen.tsx  # Triggers apiClient.analyzeMusic()
│   │   └── index.ts        # Clean exports
│   ├── results-sharing/    # Real data display
│   │   ├── components/     # ResultsScreen with real analysis data
│   │   │   └── ResultsScreen.tsx  # Accepts MusicAnalysisResponse
│   │   └── index.ts        # Clean exports
│   └── ui-foundation/      # Theme, design system
├── lib/backend/           # Enhanced API client with analysis endpoints
│   └── apiClient.ts       # Added analyzeMusic() and getLatestAnalysis()
└── app/                   # Smart routing logic with state-based navigation
    └── page.tsx           # Implements direct flow pattern
```

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
├── music/         # Music Domain (Enhanced for Real Analysis)
│   ├── models.py     # MusicAnalysis, Track, Artist models
│   ├── service.py    # Music analysis business logic
│   ├── router.py     # Music API endpoints (/analyze, /analysis/latest)
│   ├── spotify.py    # Spotify music data client
│   ├── schemas.py    # Request/response schemas
│   └── utils.py      # Music data utilities
├── shared/        # Shared Utilities Domain
│   ├── api_client.py # Base HTTP client patterns
│   ├── pagination.py # Pagination utilities
│   └── validators.py # Common validation logic
└── main.py        # Application entry point
```

### Component Relationships (Enhanced)

#### Frontend Components (Direct Flow)
```
App (Smart Routing)
├── AuthProvider (Enhanced with analysis state)
│   ├── latestAnalysis: MusicAnalysisResponse | null
│   ├── analysisLoading: boolean
│   └── refreshLatestAnalysis: () => Promise<void>
├── Direct Flow Router
│   ├── LoginScreen (No welcome screen)
│   ├── LoadingScreen (Real analysis integration)
│   │   ├── Triggers apiClient.analyzeMusic()
│   │   └── Updates auth context on completion
│   └── ResultsScreen (Real data display)
│       ├── Displays MusicAnalysisResponse
│       ├── "Analyze Again" → LoadingScreen
│       └── "Judge Someone Else" → LoginScreen
└── ApiClient (Enhanced with analysis endpoints)
    ├── analyzeMusic(): Promise<MusicAnalysisResponse>
    └── getLatestAnalysis(): Promise<MusicAnalysisResponse | null>
```

#### Backend Domain Services (Enhanced)
```
FastAPI App
├── API Routes (/api/v1/)
│   ├── auth/ (Authentication domain)
│   ├── music/ (Music domain - Real analysis)
│   │   ├── POST /analyze (Trigger new analysis)
│   │   └── GET /analysis/latest (Get existing results)
│   ├── analysis/ (Analysis domain - Phase 4)
│   └── share/ (Sharing domain - Phase 5)
├── Domain Services
│   ├── auth/
│   │   ├── UserService (user management)
│   │   └── SpotifyAuthClient (OAuth flow)
│   ├── music/ (Enhanced)
│   │   ├── MusicAnalysisService (AI analysis business logic)
│   │   └── SpotifyMusicClient (data retrieval)
│   └── shared/
│       └── BaseApiClient (common patterns)
├── Data Models (SQLModel)
│   ├── auth/models.py
│   │   ├── User
│   │   └── SpotifyToken
│   └── music/models.py (Enhanced)
│       ├── MusicAnalysis (Analysis results with sharing)
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

### Revolutionary UX Patterns (New)

#### Direct Flow Pattern ✅
```typescript
// Eliminates intermediate screens based on user state
const DirectFlowPattern = {
  principle: "Route users directly to their intended destination",
  implementation: "State-based routing without welcome screens",
  benefits: [
    "Reduced friction",
    "Faster user engagement",
    "Cleaner user experience",
    "Fewer abandoned sessions"
  ]
};

// Implementation
const useDirectFlow = () => {
  // Automatically determine destination based on:
  // 1. Authentication status
  // 2. Existing analysis data
  // 3. Loading states

  if (authenticated && hasAnalysis) return 'results';
  if (authenticated && !hasAnalysis) return 'loading';
  return 'login';
};
```

#### Real-Time State Synchronization Pattern ✅
```typescript
// Authentication context tracks analysis state
interface AuthState {
  // Traditional auth state
  user: User | null;
  isAuthenticated: boolean;

  // Enhanced with analysis state
  latestAnalysis: MusicAnalysisResponse | null;
  analysisLoading: boolean;
}

// Loading screen updates auth context after analysis
const LoadingScreen = () => {
  const { refreshLatestAnalysis } = useAuth();

  const startAnalysis = async () => {
    await apiClient.analyzeMusic();
    await refreshLatestAnalysis(); // Sync state
    onComplete(); // Navigate to results
  };
};
```

### Domain-Driven Design Patterns (Enhanced)

#### Functional Cohesion (Enhanced)
```python
# Each domain module has a single, well-defined purpose

# auth/service.py - User management + analysis state
class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_user(self, user_create: UserCreate) -> User:
        # Pure user creation logic
        pass

    async def get_latest_analysis(self, user_id: int) -> MusicAnalysis | None:
        # Retrieve user's most recent analysis
        pass

# music/service.py - Music analysis business logic
class MusicAnalysisService:
    async def analyze_user_music(self, user_id: int) -> MusicAnalysis:
        # Orchestrate Spotify data retrieval and AI analysis
        pass

    async def get_user_latest_analysis(self, user_id: int) -> MusicAnalysis | None:
        # Retrieve existing analysis results
        pass
```

#### Domain Isolation (Enhanced)
```python
# Clear boundaries with enhanced cross-domain communication

# auth/router.py - Authentication with analysis state
from ..core import get_session, create_user_token
from .service import UserService
from .spotify import spotify_auth_client

# music/router.py - Music analysis endpoints
from ..core import get_session, get_current_user_id
from .service import MusicAnalysisService

@router.post("/analyze")
async def analyze_music(
    user_id: int = Depends(get_current_user_id),
    service: MusicAnalysisService = Depends()
) -> MusicAnalysisResponse:
    return await service.analyze_user_music(user_id)
```

#### Service Layer Pattern (Enhanced)
```python
# Domain-specific services with real analysis integration

# music/service.py
class MusicAnalysisService:
    """Handles all music analysis business logic."""

    async def analyze_user_music(self, user_id: int) -> MusicAnalysis:
        # 1. Get user's Spotify token
        # 2. Fetch music data from Spotify
        # 3. Run AI analysis
        # 4. Store results with sharing token
        # 5. Return analysis response
        pass

    async def get_user_latest_analysis(self, user_id: int) -> MusicAnalysis | None:
        # Retrieve most recent analysis for user
        pass
```

### Service Decomposition Patterns (Phase 2 Achievement) ✅

#### God Object Elimination Pattern ✅
```python
# BEFORE: God Object antipattern
class MusicAnalysisService:
    # 382 lines of mixed responsibilities
    async def _get_valid_access_token(self, user_id: int) -> str:
        # Token management logic (45 lines)

    async def _fetch_user_music_data(self, user_id: int) -> dict:
        # Data collection logic (93 lines)

    async def _analyze_music_with_ai(self, music_data: dict) -> dict:
        # Analysis orchestration (29 lines)

    def _fallback_analysis(self, music_data: dict) -> dict:
        # Complex fallback logic (92 lines, D-22 complexity)

    async def analyze_user_music_taste(self, user_id: int) -> Response:
        # Database persistence (28 lines)

# AFTER: Service decomposition with focused responsibilities
class TokenRefreshService:          # B-7 complexity
    async def get_valid_access_token(self, user_id: int) -> str:
        # Single responsibility: token lifecycle management

class SpotifyDataCollector:         # B-7 complexity
    async def fetch_user_music_data(self, user_id: int) -> dict:
        # Single responsibility: data fetching

class AnalysisCoordinator:          # B-8 complexity overall
    async def analyze_user_music_taste(self, user_id: int) -> Response:
        # Single responsibility: workflow orchestration

    def _fallback_analysis(self, music_data: dict) -> dict:
        # Complex logic isolated (D-22, but contained)

class ResultPersister:              # Focused service
    async def save_analysis_result(self, user_id: int, data: dict) -> Response:
        # Single responsibility: database operations

class MusicAnalysisService:         # 15 lines (96% reduction)
    # Simple facade over decomposed services
    def __init__(self, session: AsyncSession):
        self.coordinator = AnalysisCoordinator(session)
        self.result_persister = ResultPersister(session)
```

#### Dependency Injection Pattern ✅
```python
# Dependency flow in decomposed architecture
class AnalysisCoordinator:
    def __init__(self, session: AsyncSession):
        self.token_service = TokenRefreshService(session)
        self.data_collector = SpotifyDataCollector(self.token_service)
        self.result_persister = ResultPersister(session)
        self.ai_client = MusicAnalysisAI()

# Benefits achieved:
# - Clear dependency hierarchy
# - Testable in isolation
# - Mockable external dependencies
# - Single Responsibility Principle
```

#### Test Pattern Updates for Service Decomposition ✅
```python
# BEFORE: Monolithic mocking
with patch("src.unwrapped.music.analysis_service.spotify_music_client"):
    # Mock single service

# AFTER: Targeted service mocking
with patch("src.unwrapped.music.spotify_data_collector.spotify_music_client"), \
     patch("src.unwrapped.music.token_refresh_service.spotify_music_client"), \
     patch("src.unwrapped.music.analysis_coordinator.MusicAnalysisAI") as mock_ai:

    # Configure AI mock for async operation
    async def mock_analyze_music_taste(music_data):
        return {"rating_text": "TEST", "x_axis_pos": 0.5}
    mock_ai.return_value.analyze_music_taste = mock_analyze_music_taste

# Key insight: Service decomposition requires updating test mocks to target
# specific services rather than monolithic classes
```

#### Architecture Remediation Process ✅
```markdown
Phase 1: Immediate Wins (Completed)
- Complexity baseline measurement
- Duplicate API client elimination
- Error boundary implementation
- Routing logic extraction
- Structured logging implementation

Phase 2: Service Decomposition (Completed)
- God object elimination
- Focused service creation
- Dependency injection implementation
- Test pattern updates
- Complexity validation

Results Achieved:
- 96% reduction in main service lines (382 → 15)
- Maintained all 59 tests passing
- 66% code coverage preserved
- Zero breaking changes to external APIs
- Isolated complex logic in appropriate services
```

#### Complexity Management Pattern ✅
```python
# Strategy: Isolate high complexity, decompose low complexity
def complexity_management_strategy(complexity_score):
    if complexity_score >= 20:  # D grade
        # Keep complex logic in focused service
        return "isolate_and_contain"
    elif complexity_score >= 7:  # B grade
        # Extract to focused service
        return "extract_to_service"
    else:  # A grade
        # Leave in place or combine with similar logic
        return "optimize_in_place"

# Applied to MusicAnalysisService:
# - _fallback_analysis (D-22): Isolated in AnalysisCoordinator
# - _fetch_user_music_data (B-8): Extracted to SpotifyDataCollector
# - _get_valid_access_token (B-7): Extracted to TokenRefreshService
# - Main service (A-2): Simplified to facade pattern
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

#### Timezone-Aware Database Patterns (Implemented) ✅
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

# music/models.py - Timezone-aware analysis timestamps
class MusicAnalysis(SQLModel, table=True):
    analyzed_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True))
    )
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
