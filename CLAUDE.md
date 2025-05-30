# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Backend Development
```bash
cd backend/
uv run uvicorn src.unwrapped.main:app --reload         # Dev server (HTTPS on :8443)
uv run pytest                                         # Run tests
uv run pytest --cov=src --cov-report=html            # Test with coverage
uv run ruff check . && uv run ruff format .          # Lint and format
```

### FastAPI extentions
-  always use background tasks for long running apis

### Frontend Development
```bash
cd frontend/
npm run dev                                           # Dev server on :5174
npm run build                                        # Production build
npm run lint                                         # ESLint check
```

### Database Management
```bash
task db-up                                           # Start PostgreSQL
task db:migrate:apply                               # Apply migrations
task db:migrate:diff                                # Generate new migration
task db:migrate:status                              # Check migration status
```

### Quality Assurance
```bash
task test-all                                       # Run backend tests
task lint-all                                       # Lint backend + frontend
task format-all                                     # Format backend code
```

## Architecture Overview

### Backend (FastAPI + PostgreSQL)
- **Framework**: FastAPI with async/await patterns
- **Database**: PostgreSQL with SQLModel/SQLAlchemy ORM
- **Authentication**: JWT tokens + Spotify OAuth2 flow
- **Package Management**: `uv` (NEVER edit pyproject.toml dependencies directly)
- **Migrations**: Atlas CLI for schema management
- **Testing**: pytest with testcontainers (auto-spins up PostgreSQL)

**Key Modules:**
- `src/unwrapped/auth/`: Authentication, user management, Spotify OAuth
- `src/unwrapped/music/`: Music analysis, AI integration, sharing features
- `src/unwrapped/core/`: Config, database, security, shared utilities

### Frontend (Next.js 15 + TypeScript)
- **Framework**: Next.js 15 with App Router
- **UI Library**: Material-UI v7 + Tailwind CSS v4
- **State Management**: React Context API
- **Architecture**: Domain-driven design with SSR-safe patterns

**Domain Structure:**
- `domains/authentication/`: Auth flows, user context, API client hooks
- `domains/music-analysis/`: Music data fetching and analysis UI
- `domains/results-sharing/`: Share analysis results
- `domains/ui-foundation/`: Shared components, theme, utilities

## Critical Implementation Rules

### Python/Backend Standards
- **Dependencies**: Use `uv add package-name` (never edit pyproject.toml directly)
- **Typing**: Use modern syntax (`str | None`, not `Optional[str]`)
- **Datetime**: `datetime.now(UTC)` not deprecated `datetime.utcnow()`
- **Exceptions**: Always chain with `raise HTTPException(...) from e`
- **Async**: Use async/await for all database and HTTP operations

### SSR-Safe Frontend Patterns
**MANDATORY**: All frontend code must be SSR-compatible
- **NO `typeof window !== 'undefined'` checks** - use proper SSR patterns
- **API clients must be browser-API-free** - clean separation of concerns
- **Use SSR-safe hooks that return null during SSR**

**Required API Client Pattern:**
```typescript
// ✅ CORRECT: SSR-safe hook
export function useApiClient(): AuthenticatedApiClient | null {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  if (!isClient) return null; // SSR-safe
  return { /* client implementation */ };
}

// ✅ CORRECT: Component usage
function MyComponent() {
  const apiClient = useApiClient();
  useEffect(() => {
    if (!apiClient) return; // Always check for null
    apiClient.getCurrentUser().then(setUser);
  }, [apiClient]);
}
```

### Authentication Flow
1. Frontend calls `/api/v1/auth/login` → Get Spotify auth URL
2. User authorizes → Spotify redirects to `/api/v1/auth/callback`
3. Backend exchanges code for tokens → Creates/updates user → Returns JWT
4. Frontend stores JWT in client-side storage
5. Subsequent API calls include `Authorization: Bearer <jwt>` header

### Database Migrations
- **Generate**: `task db:migrate:diff` after model changes
- **Apply**: `task db:migrate:apply` before running server
- **Always commit both model changes AND migration files together**

### Code Quality Requirements
- **Zero linting errors** in committed code
- **Run quality checks** before committing: `task lint-all && task test-all`
- **Current test coverage**: 45% (maintain or improve)

## Development Environment Setup
1. Install dependencies: `task install`
2. Start database: `task db-up`
3. Apply migrations: `task db:migrate:apply`
4. Start backend: `task backend-start` (runs on https://127.0.0.1:8443)
5. Start frontend: `task frontend-start` (runs on https://127.0.0.1:5174)

## Project Status
**Phase 2 (Authentication)**: ✅ Complete
**Phase 3 (Music Data)**: 🚧 In Progress
**Phase 4 (AI Analysis)**: ⏳ Planned

Current implementation includes full Spotify OAuth integration, JWT authentication, user management, and SSR-ready frontend architecture.
