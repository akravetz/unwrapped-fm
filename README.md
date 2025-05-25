# 🎵 unwrapped.fm

A single-page application that integrates with Spotify to analyze your music taste using AI. Get personalized insights and shareable results about your musical preferences.

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (for PostgreSQL database)
- [Task](https://taskfile.dev/installation/) (for running development commands)
- [uv](https://github.com/astral-sh/uv) (for Python package management)
- [Node.js 18+](https://nodejs.org/) (for frontend development)

### Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd unwrapped-fm
   task install
   ```

2. **Configure Spotify OAuth**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Set redirect URI to: `http://localhost:8000/api/v1/auth/callback`
   - Copy your Client ID and Client Secret
   - Update `backend/.env`:
     ```bash
     SPOTIFY_CLIENT_ID=your_actual_client_id
     SPOTIFY_CLIENT_SECRET=your_actual_client_secret
     ```

3. **Start Development Environment**
   ```bash
   # Start database
   task db-up

   # Start backend (new terminal)
   task backend-start

   # Start frontend (new terminal)
   task frontend-start
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - pgAdmin: http://localhost:5050 (admin@unwrapped.fm / admin)

## 🛠️ Development Commands

### Database Management
```bash
task db-up          # Start PostgreSQL
task db-down        # Stop PostgreSQL
task db-reset       # Reset database
task db-logs        # View database logs
task pgadmin-up     # Start pgAdmin web interface
```

### Backend Development
```bash
task backend-start    # Start FastAPI server
task backend-test     # Run tests
task backend-lint     # Check code quality
task backend-format   # Format code
```

### Frontend Development
```bash
task frontend-start   # Start Vite dev server
task frontend-build   # Build for production
task frontend-lint    # Check code quality
```

### Quality Assurance
```bash
task test-all       # Run all tests
task lint-all       # Lint all code
task format-all     # Format all code
```

### Cleanup
```bash
task clean          # Stop all services and cleanup
```

## 🏗️ Architecture

### Backend
- **FastAPI** with async/await patterns
- **PostgreSQL** with SQLModel/SQLAlchemy
- **JWT** authentication with Spotify OAuth2
- **Pydantic v2** for configuration and validation
- **pytest** with testcontainers for testing
- **Ruff** for linting and formatting

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for state management

### Infrastructure
- **Docker Compose** for PostgreSQL database
- **Task** for unified command interface
- **uv** for Python dependency management
- **Testcontainers** for integration testing

## 🔐 Authentication Flow

1. User clicks "Connect with Spotify"
2. Frontend calls `/api/v1/auth/login`
3. Backend redirects to Spotify OAuth
4. User authorizes access
5. Spotify redirects to `/api/v1/auth/callback`
6. Backend exchanges code for tokens
7. Backend creates/updates user in database
8. Backend generates JWT and redirects to frontend
9. Frontend stores JWT and shows authenticated state

## 📊 Current Status

**Phase 2: Authentication** ✅ **COMPLETE**
- [x] Docker + PostgreSQL setup
- [x] Backend authentication system (JWT + Spotify OAuth)
- [x] Frontend authentication flow
- [x] User profile management
- [x] Protected routes
- [x] Error handling
- [x] Testcontainers integration
- [x] Task-based development workflow

**Phase 3: Music Data** 🚧 **NEXT**
- [ ] Spotify API data fetching
- [ ] User music library analysis
- [ ] Background job processing
- [ ] Data caching strategies

**Phase 4: AI Analysis** ⏳ **PLANNED**
- [ ] OpenAI integration
- [ ] Music taste analysis
- [ ] Personalized insights
- [ ] Shareable results

## 🧪 Testing

### Backend Tests
```bash
cd backend
uv run pytest -v
```

Tests use testcontainers to spin up PostgreSQL automatically. No manual database setup required.

### Test Coverage
Current backend coverage: **45%**

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/unwrapped
SECRET_KEY=your-secret-key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

**Frontend** (automatic):
```bash
VITE_API_BASE_URL=http://localhost:8000
```

## 📁 Project Structure

```
unwrapped-fm/
├── backend/                 # FastAPI backend
│   ├── src/unwrapped/      # Source code
│   ├── tests/              # Test suite
│   ├── .env                # Environment config
│   └── pyproject.toml      # Python dependencies
├── frontend/               # React frontend
│   ├── src/                # Source code
│   └── package.json        # Node dependencies
├── docker-compose.yml      # PostgreSQL setup
├── Taskfile.yml           # Development commands
└── scripts/               # Database scripts
```

## 🤝 Contributing

1. Install development dependencies: `task install`
2. Make your changes
3. Run quality checks: `task lint-all`
4. Run tests: `task test-all`
5. Submit a pull request

## 📝 License

[Add your license here]
