# Technical Context - unwrapped.fm

## Technology Stack

### Backend (Python)
- **Framework**: FastAPI 0.104+ with async/await
- **Python**: 3.13 with modern typing (`|` unions, no `Optional`)
- **Database**: PostgreSQL with SQLModel (Pydantic v2)
- **Migrations**: Atlas CLI with Python script mode
- **Package Management**: uv (fast Python package manager)
- **Testing**: pytest with pytest-asyncio, 64% coverage

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for modern UI
- **Build Tool**: Vite for fast development
- **State Management**: React Context for auth state

### Infrastructure
- **Database**: PostgreSQL 15 in Docker container
- **Development**: Docker Compose for local services
- **SSL**: Self-signed certificates for HTTPS development

## Development Environment

### Project Structure
```
unwrapped-fm/
├── backend/
│   ├── src/unwrapped/          # Main application code
│   │   ├── auth/                # Authentication module
│   │   ├── music/               # Music analysis module
│   │   └── core/                # Shared utilities
│   ├── tests/                   # Test suite
│   ├── scripts/                 # Atlas migration scripts
│   └── migrations/              # Database migrations
├── frontend/                    # React application
└── .cursor/memory-bank/         # Project documentation
```

### Key Dependencies

#### Backend Core
```toml
fastapi = "^0.104.0"
sqlmodel = "^0.0.14"
asyncpg = "^0.29.0"
uvicorn = "^0.24.0"
```

#### Authentication & Security
```toml
python-jose = {extras = ["cryptography"], version = "^3.3.0"}
passlib = {extras = ["bcrypt"], version = "^1.7.4"}
httpx = "^0.25.0"  # Spotify API client
```

#### Development Tools
```toml
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
ruff = "^0.1.0"  # Linting and formatting
```

## Development Workflow

### Backend Commands
```bash
cd backend/
uv run uvicorn src.unwrapped.main:app --reload  # Dev server
uv run pytest                                     # Run tests
uv run ruff check . && uv run ruff format .      # Code quality
```

### Database Management
```bash
task db-up                    # Start PostgreSQL
task db-reset                 # Reset database
task db:migrate:diff          # Generate migration
task db:migrate:apply         # Apply migrations
task db:migrate:status        # Check status
```

### Frontend Commands
```bash
cd frontend/
npm run dev    # Development server
npm run build  # Production build
npm run test   # Run tests
```

## Configuration Management

### Environment Variables
```bash
# Backend (.env)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=https://127.0.0.1:8443/api/v1/auth/callback
SECRET_KEY=your_jwt_secret
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/unwrapped

# Frontend (.env)
VITE_API_BASE_URL=https://127.0.0.1:8443
```

### Modern Python Patterns
- **Type hints**: Use `|` instead of `Union`, `list[str]` instead of `List[str]`
- **Datetime**: `datetime.now(UTC)` instead of deprecated `utcnow()`
- **Pydantic v2**: `ConfigDict` instead of class-based Config
- **Async everywhere**: Database, HTTP calls, file operations

## Quality Standards

### Code Quality
- **Linting**: Ruff for fast Python linting
- **Formatting**: Ruff for consistent code style
- **Type checking**: Modern Python typing patterns
- **Import sorting**: Automatic import organization

### Testing Strategy
- **Unit tests**: Individual component testing
- **Integration tests**: API endpoint testing
- **Database tests**: Transaction rollback isolation
- **Mock strategy**: Spotify API and external services

### Performance Considerations
- **Async I/O**: Non-blocking database and API calls
- **Connection pooling**: Efficient database connections
- **Minimal data storage**: Only essential data persisted
- **Fast startup**: Optimized import structure

## Security Implementation

### Authentication Security
- **OAuth 2.0**: Spotify's secure authentication flow
- **JWT tokens**: Stateless session management
- **Token rotation**: Automatic refresh handling
- **HTTPS only**: All communication encrypted

### Data Security
- **Minimal storage**: No sensitive music data stored
- **Token encryption**: Secure Spotify token storage
- **Input validation**: All user inputs validated
- **CORS protection**: Restricted to known origins

## Deployment Considerations

### Production Readiness
- **Error handling**: Comprehensive exception management
- **Logging**: Structured logging for debugging
- **Health checks**: API health monitoring endpoints
- **Graceful shutdown**: Proper resource cleanup

### Scalability Patterns
- **Stateless design**: Easy horizontal scaling
- **Database optimization**: Efficient queries and indexes
- **Caching strategy**: Results caching for performance
- **Rate limiting**: Protection against abuse
