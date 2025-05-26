# System Patterns - unwrapped.fm

## Architecture Overview

### Three-Tier Architecture
```
Frontend (React + TypeScript)
    ↓ HTTPS/REST API
Backend (FastAPI + Python)
    ↓ SQL/Atlas
Database (PostgreSQL)
```

### Core Design Patterns

#### 0. **SSR-First Architecture (MANDATORY)**
```
NEVER use typeof window !== 'undefined' checks
ALWAYS separate HTTP clients from browser APIs
ALWAYS use SSR-safe hooks for API access
ALWAYS return null during SSR, handle gracefully in components
```

**Key Principles:**
- **Separation of Concerns**: HTTP operations vs browser API access
- **Explicit Dependencies**: Tokens passed as parameters, not hidden in interceptors
- **SSR Safety**: Hooks return null during SSR, components handle gracefully
- **Type Safety**: Clear interfaces and explicit error handling

#### 1. **Three-Modal User Flow**
```
LoginModal → LoadingModal → ResultsModal
     ↓            ↓            ↓
  OAuth Flow → AI Analysis → Share Link
```

#### 2. **Automatic Sharing Pattern**
```
Analysis Creation → Token Generation → Public Access
       ↓                  ↓              ↓
   Store Result → Secure 15-char → No Auth Required
```

#### 3. **Stateless Analysis Pattern**
```
Fetch Spotify Data → Analyze → Return Results
        ↓              ↓           ↓
   (No Storage) → AI Logic → Store Only Verdict
```

## Backend Patterns

### Service Layer Architecture
```python
# Clean separation of concerns
Router → Service → Database
  ↓        ↓         ↓
HTTP → Business → Persistence
```

**Example Implementation:**
```python
# Router (HTTP layer)
@router.post("/analyze")
async def analyze_music(session: AsyncSession = Depends(get_session)):
    service = MusicAnalysisService(session)
    return await service.analyze_user_music_taste(user_id)

# Service (Business layer)
class MusicAnalysisService:
    async def analyze_user_music_taste(self, user_id: int):
        # 1. Fetch data
        music_data = await self._fetch_user_music_data(user_id)
        # 2. Analyze
        analysis = await self._analyze_music_with_ai(music_data)
        # 3. Generate share token
        token = await generate_unique_share_token(self.session)
        # 4. Store and return
        return await self._store_and_return_result(analysis, token)
```

### Database Patterns

#### Minimal Schema Design
```sql
-- Only essential data stored
user (auth + spotify tokens)
musicanalysisresult (verdict + sharing)
```

#### Migration Pattern with Atlas
```bash
# Schema changes via Atlas
atlas migrate diff feature_name --env local
atlas migrate apply --env local
```

#### Secure Token Generation
```python
# Cryptographically secure sharing
def generate_share_token() -> str:
    alphabet = string.ascii_letters + string.digits  # 62 chars
    return ''.join(secrets.choice(alphabet) for _ in range(15))
    # 62^15 = ~1.4 × 10^26 combinations
```

### API Design Patterns

#### RESTful Endpoints
```
POST /api/v1/music/analyze          # Create analysis
GET  /api/v1/music/analysis/latest  # Get user's latest
GET  /api/v1/public/share/{token}   # Public viewing (no auth)
```

#### Error Handling Pattern
```python
try:
    result = await spotify_api_call()
except Exception as e:
    # Graceful degradation
    logger.error(f"Spotify API failed: {e}")
    result = {"items": []}  # Empty fallback
```

#### Authentication Pattern
```python
# JWT + Spotify OAuth
@router.post("/analyze")
async def analyze(current_user: User = Depends(get_current_user)):
    # Protected endpoint with user context
```

## Frontend Patterns

### SSR-Compatible Architecture (CRITICAL)
**ALWAYS use SSR-safe patterns for Next.js compatibility**

#### API Client Architecture
```typescript
// ✅ CORRECT: Clean separation of concerns
src/lib/
├── api/apiClient.ts          # Pure HTTP client (no browser APIs)
├── tokens/tokenService.ts    # Browser API management only
└── hooks/useApiClient.ts     # SSR-safe hook combining both

// ❌ NEVER: Direct browser API access in HTTP clients
class ApiClient {
  private getToken() {
    if (typeof window === 'undefined') return null; // ANTI-PATTERN
  }
}
```

#### SSR-Safe Hook Pattern
```typescript
// ✅ REQUIRED PATTERN for all API access
export function useApiClient(): AuthenticatedApiClient | null {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Only runs on client
  }, []);

  if (!isClient) {
    return null; // SSR-safe: returns null during server rendering
  }

  return {
    getCurrentUser: async () => {
      const token = TokenService.getToken();
      if (!token) throw new Error('No authentication token');
      return apiClient.getCurrentUser(token); // Explicit token passing
    }
  };
}
```

#### Component Usage Pattern
```typescript
// ✅ REQUIRED: Always check for null apiClient
function MyComponent() {
  const apiClient = useApiClient();

  useEffect(() => {
    if (!apiClient) return; // SSR-safe guard

    apiClient.getCurrentUser().then(setUser);
  }, [apiClient]);
}
```

### Context-Based State Management
```typescript
// Centralized state with React Context
AuthContext → User authentication state
AnalysisContext → Analysis flow state
```

#### Analysis Flow State Machine
```typescript
type AnalysisStage = 'login' | 'loading' | 'results' | 'error';

// State transitions
login → (auth success) → loading → (analysis complete) → results
  ↓                        ↓                              ↓
error ← (auth failed) ← error ← (analysis failed) ← error
```

### Component Architecture
```
App (Router)
├── LoginModal (OAuth initiation)
├── LoadingModal (Progress + messages)
├── ResultsModal (Verdict + sharing)
└── PublicAnalysisView (Public sharing page)
```

### Sharing UI Pattern
```typescript
// Wireframe-accurate implementation
<TextField
  value={shareUrl}
  InputProps={{
    endAdornment: (
      <IconButton onClick={handleCopyUrl}>
        <ContentCopy />
      </IconButton>
    )
  }}
/>
```

### Routing Pattern
```typescript
// Public/private route separation
<Routes>
  <Route path="/share/:token" element={<PublicAnalysisView />} />
  <Route path="/" element={<AuthenticatedApp />} />
</Routes>
```

## Security Patterns

### Token Security
```python
# Share tokens
- 15 characters from 62-character alphabet
- Cryptographically secure generation
- Database uniqueness constraint
- No expiration (permanent sharing)
```

### Authentication Security
```python
# JWT + Spotify OAuth
- Secure token storage in localStorage
- Automatic token refresh
- Proper CORS configuration
- HTTPS in production
```

### Data Privacy
```python
# Public sharing privacy
- Only analysis results exposed
- No user personal information
- No Spotify listening data
- Anonymous public viewing
```

## Error Handling Patterns

### Backend Error Handling
```python
# Graceful degradation pattern
try:
    spotify_data = await fetch_spotify_data()
except SpotifyAPIError:
    # Continue with empty data
    spotify_data = {"items": []}

# Always return a result
if not spotify_data:
    return default_analysis("MYSTERIOUS LISTENER")
```

### Frontend Error Handling
```typescript
// User-friendly error states
if (error) {
  return <LoginModal open={true} />; // Retry flow
}

// Loading states
if (loading) {
  return <LoadingModal open={true} />;
}
```

## Performance Patterns

### Database Optimization
```sql
-- Efficient indexes
CREATE UNIQUE INDEX ix_musicanalysisresult_share_token
ON musicanalysisresult (share_token);

CREATE INDEX ix_user_spotify_id
ON user (spotify_id);
```

### API Optimization
```python
# Batch Spotify API calls
track_ids = list(all_track_ids)
for i in range(0, len(track_ids), 100):  # Spotify limit
    batch = track_ids[i:i+100]
    features = await get_audio_features(batch)
```

### Frontend Optimization
```typescript
// Lazy loading and code splitting
const PublicAnalysisView = lazy(() => import('./PublicAnalysisView'));

// Efficient state updates
const [state, setState] = useState(initialState);
setState(prev => ({ ...prev, newField: value }));
```

## Testing Patterns

### Backend Testing
```python
# Async test patterns
@pytest.mark.asyncio
async def test_analysis_service():
    async with AsyncSession() as session:
        service = MusicAnalysisService(session)
        result = await service.analyze_user_music_taste(user_id)
        assert result.rating_text is not None
```

### Test Coverage Strategy
```
Authentication: 85-100% (critical security)
Analysis Logic: 46-69% (business logic)
Database Layer: 78% (data integrity)
Core Utils: 78-94% (shared functionality)
```

## Deployment Patterns

### Development Setup
```bash
# Backend
cd backend/
uv run uvicorn src.unwrapped.main:app --reload --port 8443

# Frontend
cd frontend/
npm run dev  # Port 5175

# Database
atlas migrate apply --env local
```

### Production Considerations
```python
# Environment-based configuration
DATABASE_URL = os.getenv("DATABASE_URL")
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
```

## Key Design Decisions

### 1. **Automatic Sharing**
- **Decision**: Generate share tokens automatically
- **Rationale**: Removes friction, matches user wireframe
- **Implementation**: Secure tokens with every analysis

### 2. **Stateless Analysis**
- **Decision**: Don't store Spotify music data
- **Rationale**: Privacy, simplicity, storage efficiency
- **Implementation**: Fetch → Analyze → Discard → Store verdict only

### 3. **Three-Modal Flow**
- **Decision**: Single-page app with modal progression
- **Rationale**: Matches wireframe, smooth UX
- **Implementation**: React Context state machine

### 4. **Public Sharing**
- **Decision**: No authentication for viewing shared results
- **Rationale**: Maximum shareability, viral potential
- **Implementation**: Public API endpoint with secure tokens

These patterns create a secure, scalable, and maintainable architecture that delivers the core product vision while maintaining high code quality and user experience standards.
