# System Patterns - unwrapped.fm

## Architecture Overview

### Simplified Three-Layer Architecture
```
Frontend (React) → API Gateway (FastAPI) → Database (PostgreSQL)
                ↓
            Spotify API
```

## Key Design Patterns

### 1. Stateless Analysis Pattern
- **No music data persistence** - fetch, analyze, discard
- **Results-only storage** - store AI verdict, not raw data
- **Fresh data every time** - always current listening habits

### 2. Token Management Pattern
- **Automatic refresh** - tokens refreshed 5 minutes before expiry
- **Graceful degradation** - clear error messages for auth failures
- **Session persistence** - JWT tokens for frontend state

### 3. Service Layer Pattern
```
Router → Service → External API
  ↓        ↓           ↓
 HTTP   Business    Spotify
Logic    Logic      Integration
```

## Database Design (Simplified)

### Core Tables
```sql
-- User authentication and Spotify tokens
user (
  id, spotify_id, email, display_name,
  access_token, refresh_token, token_expires_at
)

-- AI analysis results only
musicanalysisresult (
  id, user_id, rating_text, rating_description,
  x_axis_pos, y_axis_pos, created_at
)
```

### Migration Strategy
- **Atlas migrations** - version-controlled schema changes
- **Fresh start approach** - clean database reset for major refactors
- **Simplified models** - removed complex music storage

## API Design Patterns

### RESTful Endpoints
```
POST /api/v1/music/analyze        # Main analysis endpoint
GET  /api/v1/music/analysis/latest # Get previous results
GET  /api/v1/auth/me              # User profile
POST /api/v1/auth/login           # Spotify OAuth
```

### Response Patterns
```json
{
  "rating_text": "PARTY ANIMAL",
  "rating_description": "Your music taste...",
  "x_axis_pos": 0.3,
  "y_axis_pos": 0.8,
  "analyzed_at": "2024-05-25T04:45:00Z"
}
```

## Error Handling Patterns

### Exception Hierarchy
```
SpotifyAPIError → HTTPException(502)
AuthenticationError → HTTPException(401)
ValidationError → HTTPException(400)
```

### Graceful Degradation
- **Token refresh failures** - redirect to re-auth
- **Spotify API errors** - user-friendly messages
- **Analysis failures** - fallback to basic analysis

## Testing Patterns

### Test Structure
```
tests/
├── test_auth.py              # Authentication logic
├── test_analyze_endpoint.py  # Analysis endpoints
├── test_user_service.py      # User management
└── conftest.py              # Shared fixtures
```

### Mock Strategy
- **Spotify API mocking** - consistent test data
- **Database isolation** - transaction rollback per test
- **JWT token generation** - valid tokens for auth tests

## Security Patterns

### Authentication Flow
1. **Spotify OAuth** - secure third-party auth
2. **JWT tokens** - stateless session management
3. **Token rotation** - automatic refresh handling
4. **CORS configuration** - frontend-specific origins

### Data Protection
- **No sensitive storage** - music data not persisted
- **Token encryption** - secure storage of Spotify tokens
- **Input validation** - all user inputs validated

## Performance Patterns

### Async Operations
- **Non-blocking I/O** - all database and API calls async
- **Concurrent requests** - multiple Spotify API calls
- **Connection pooling** - efficient database connections

### Caching Strategy
- **No music caching** - always fresh data
- **Analysis caching** - store results for quick retrieval
- **Token caching** - avoid unnecessary refresh calls
