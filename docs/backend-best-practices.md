# Backend Best Practices
*Comprehensive guide based on unwrapped.fm project patterns*

## Technology Stack & Dependencies

### Core Technologies
- **Framework**: FastAPI (async support, automatic API docs, type hints)
- **Database**: PostgreSQL with SQLModel + SQLAlchemy (async)
- **Package Management**: uv (modern Python package management)
- **Testing**: pytest with asyncio support
- **Code Quality**: ruff (linting + formatting)
- **Database Migrations**: Atlas (schema management)
- **Authentication**: OAuth + JWT patterns

### Modern Python Requirements (3.13+)

#### Critical Dependency Management Rules ⚠️
```bash
# ✅ CORRECT: Always use uv for dependencies
uv add "fastapi>=0.115.0"
uv add "python-jose[cryptography]"  # Note quotes for extras
uv add --dev "pytest>=8.3.0"

# ❌ NEVER: Edit pyproject.toml directly for dependencies
# ❌ NEVER: Use pip directly in uv projects
```

#### Essential Dependencies
```toml
[project]
dependencies = [
    "fastapi>=0.115.12",
    "uvicorn[standard]>=0.34.2",
    "sqlmodel>=0.0.24",
    "asyncpg>=0.30.0",
    "httpx>=0.28.1",
    "pydantic>=2.11.5",
    "pydantic-settings>=2.9.1",
    "python-jose[cryptography]>=3.4.0",
    "passlib[bcrypt]>=1.7.4",
    "python-multipart>=0.0.20",
]

[dependency-groups]
dev = [
    "pytest>=8.3.5",
    "pytest-asyncio>=0.26.0",
    "pytest-cov>=6.1.1",
    "httpx>=0.28.1",
    "ruff>=0.11.11",
    "mypy>=1.15.0",
]
```

### Modern Python Patterns (Mandatory)

#### Union Syntax & Modern Imports
```python
# ✅ CORRECT: Modern union syntax
def verify_token(token: str) -> dict | None:
    pass

def get_user(user_id: int) -> User | None:
    pass

# ✅ CORRECT: Modern imports
from collections.abc import AsyncGenerator
from datetime import UTC, datetime, timedelta

# ❌ INCORRECT: Deprecated patterns
from typing import Optional, Dict, List
from datetime import timezone
```

#### Timezone-Aware DateTime (Critical)
```python
# ✅ CORRECT: Modern timezone-aware patterns
from datetime import UTC, datetime
from sqlalchemy import Column, DateTime

# Database models with timezone awareness
class User(SQLModel, table=True):
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True))
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True))
    )

# Service methods
async def update_user(self, user_id: int) -> User:
    user.updated_at = datetime.now(UTC)  # ✅ CORRECT
    # user.updated_at = datetime.utcnow()  # ❌ DEPRECATED
```

#### Pydantic v2 Compliance
```python
# ✅ CORRECT: Pydantic v2 patterns
from pydantic import BaseSettings, ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env")

    database_url: str
    secret_key: str

# ❌ INCORRECT: Deprecated class-based Config
class Settings(BaseSettings):
    class Config:  # Deprecated
        env_file = ".env"
```

## Architecture Patterns

### Domain-Driven Design Structure

#### Recommended Project Structure
```
src/your_project/
├── core/          # Infrastructure Domain
│   ├── config.py     # Configuration management
│   ├── database.py   # Database connection & session management
│   ├── security.py   # JWT token utilities
│   ├── exceptions.py # Custom exception classes
│   └── dependencies.py # FastAPI dependency injection
├── auth/          # Authentication Domain
│   ├── models.py     # User, Token data models
│   ├── service.py    # UserService business logic
│   ├── router.py     # Authentication API endpoints
│   └── oauth.py      # OAuth client implementations
├── [domain]/      # Business Domain (e.g., music, orders, etc.)
│   ├── models.py     # Domain-specific data models
│   ├── service.py    # Business logic
│   ├── router.py     # API endpoints
│   ├── schemas.py    # Request/response schemas
│   └── utils.py      # Domain utilities
├── shared/        # Shared Utilities Domain
│   ├── api_client.py # Base HTTP client patterns
│   ├── pagination.py # Pagination utilities
│   └── validators.py # Common validation logic
└── main.py        # Application entry point
```

#### Domain Benefits
- **🎯 Single Purpose**: Each module has one well-defined responsibility
- **📦 Domain Boundaries**: Clear separation prevents cross-domain dependencies
- **🔄 Scalability**: Easy to add new domains without affecting existing code
- **🧪 Test Organization**: Test structure mirrors source organization
- **🔍 Maintainability**: Easy to locate and modify specific functionality

### Service Decomposition Pattern

#### Before: Monolithic Service (Anti-pattern)
```python
# ❌ AVOID: God object with multiple responsibilities
class MusicAnalysisService:
    async def analyze_user_music_taste(self, user_id: int) -> Response:
        # 382 lines of mixed responsibilities:
        # - Token refresh logic
        # - Data fetching
        # - AI analysis
        # - Database persistence
        # - Error handling
        pass
```

#### After: Decomposed Services (Recommended)
```python
# ✅ CORRECT: Focused services with single responsibilities
class TokenRefreshService:
    async def get_valid_access_token(self, user_id: int) -> str:
        """Single responsibility: token lifecycle management"""
        pass

class DataCollector:
    async def fetch_user_data(self, user_id: int) -> dict:
        """Single responsibility: data fetching"""
        pass

class AnalysisCoordinator:
    def __init__(self, session: AsyncSession):
        self.token_service = TokenRefreshService(session)
        self.data_collector = DataCollector(self.token_service)
        self.result_persister = ResultPersister(session)

    async def analyze_user_data(self, user_id: int) -> Response:
        """Single responsibility: workflow orchestration"""
        pass

class MainService:  # 15 lines (96% reduction)
    def __init__(self, session: AsyncSession):
        self.coordinator = AnalysisCoordinator(session)
```

### Background Task Architecture

#### Status-Driven Processing Pattern
```python
from enum import Enum
from fastapi import BackgroundTasks

class TaskStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

# Database model with status tracking
class BackgroundTask(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    error_message: str | None = Field(default=None)
    started_at: datetime | None = Field(default=None)
    completed_at: datetime | None = Field(default=None)
    user_id: int = Field(foreign_key="user.id", unique=True)  # One per user

    # Result fields nullable for pending state
    result_data: dict | None = Field(default=None)
```

#### Three-Method Service Pattern
```python
class BackgroundTaskService:
    async def begin_task(self, user_id: int) -> BackgroundTask:
        """Idempotent: Returns existing or creates new task"""
        existing = await self.get_task_by_user(user_id)
        if existing:
            return existing

        return await self.create_task(user_id)

    async def poll_task(self, user_id: int) -> TaskStatusResponse:
        """Real-time status with timestamps"""
        task = await self.get_task_by_user(user_id)
        if not task:
            raise HTTPException(404, "Task not found")

        return TaskStatusResponse(
            status=task.status,
            started_at=task.started_at,
            completed_at=task.completed_at,
            error_message=task.error_message
        )

    async def get_result(self, user_id: int) -> TaskResult:
        """Validates completed status and returns results"""
        task = await self.get_task_by_user(user_id)
        if not task or task.status != TaskStatus.COMPLETED:
            raise HTTPException(400, "Task not completed")

        return TaskResult(data=task.result_data)
```

#### Background Task Processing
```python
async def process_background_task(task_id: int):
    """Background task processor with comprehensive error handling"""
    async with get_session() as session:
        try:
            # Update status to PROCESSING
            task = await session.get(BackgroundTask, task_id)
            task.status = TaskStatus.PROCESSING
            task.started_at = datetime.now(UTC)
            await session.commit()

            # Run actual processing
            result = await perform_actual_work(task)

            # Update status to COMPLETED
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now(UTC)
            task.result_data = result
            await session.commit()

        except Exception as e:
            # Log error and update status to FAILED
            logger.error(f"Task {task_id} failed: {e}")
            task.status = TaskStatus.FAILED
            task.error_message = str(e)
            task.completed_at = datetime.now(UTC)
            await session.commit()
```

#### API Endpoint Pattern
```python
@router.post("/task/begin", response_model=BeginTaskResponse)
async def begin_background_task(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    service: BackgroundTaskService = Depends(get_task_service)
):
    """Begin background task (idempotent)"""
    task = await service.begin_task(current_user.id)

    if task.status == TaskStatus.PENDING:
        background_tasks.add_task(process_background_task, task.id)

    return BeginTaskResponse(task_id=task.id, status=task.status)

@router.get("/task/status", response_model=TaskStatusResponse)
async def get_task_status(
    current_user: User = Depends(get_current_user),
    service: BackgroundTaskService = Depends(get_task_service)
):
    """Poll task status with timestamps"""
    return await service.poll_task(current_user.id)

@router.get("/task/result", response_model=TaskResult)
async def get_task_result(
    current_user: User = Depends(get_current_user),
    service: BackgroundTaskService = Depends(get_task_service)
):
    """Get completed task results"""
    return await service.get_result(current_user.id)
```

## Database Patterns

### Atlas Migration Workflow (Mandatory)

#### Setup Atlas Configuration
```hcl
# atlas.hcl
env "local" {
  src = "ent://src/your_project"
  dev = "docker://postgres/15/dev?search_path=public"
  url = "postgres://user:pass@localhost:5432/dbname?search_path=public&sslmode=disable"
}
```

#### Migration Commands
```bash
# Generate migration (NEVER edit schema manually)
task db:migrate:diff add_background_tasks

# Apply migrations
task db:migrate:apply

# Check migration status
task db:migrate:status
```

#### Migration Best Practices
- **NEVER edit database schema manually**
- **Always generate migrations for schema changes**
- **Commit all migrations to version control**
- **Test migrations in development before production**
- **Use descriptive migration names**

### Database Session Management

#### Async Session Configuration
```python
# core/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

#### Service Dependency Pattern
```python
# Domain service with proper session injection
class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_user(self, user_data: UserCreate) -> User:
        user = User(**user_data.model_dump())
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

# FastAPI dependency
def get_user_service(session: AsyncSession = Depends(get_session)) -> UserService:
    return UserService(session)

# Router usage
@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    service: UserService = Depends(get_user_service)
):
    return await service.create_user(user_data)
```

## Testing Patterns

### Database Isolation (Critical)

#### SQLAlchemy Joining Session Pattern
```python
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from httpx import AsyncClient, ASGITransport

@pytest_asyncio.fixture
async def async_session(async_engine) -> AsyncGenerator[AsyncSession, None]:
    """Perfect database isolation using SQLAlchemy joining session pattern."""
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
            # Rollback the external transaction - undoes all changes
            await trans.rollback()

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

#### Test Requirements
- **All test methods**: Must be `async def` and marked with `@pytest.mark.asyncio`
- **Client calls**: Must use `await client.get(...)` never `client.get(...)`
- **Database operations**: Always async with proper session management
- **Test organization**: Domain-specific test structure mirrors source organization

#### Domain-Organized Testing
```
tests/
├── core/           # Infrastructure tests
│   ├── test_security.py
│   ├── test_database.py
│   └── test_config.py
├── auth/           # Authentication domain tests
│   ├── test_auth_service.py
│   ├── test_auth_router.py
│   └── test_oauth.py
├── [domain]/       # Business domain tests
│   ├── test_service.py
│   ├── test_router.py
│   └── test_models.py
└── conftest.py     # Shared fixtures
```

### Service Testing Patterns

#### Service Isolation Testing
```python
@pytest.mark.asyncio
async def test_user_service_create_user(async_session):
    """Test service in isolation with mocked dependencies."""
    service = UserService(async_session)

    user_data = UserCreate(
        email="test@example.com",
        display_name="Test User"
    )

    user = await service.create_user(user_data)

    assert user.email == "test@example.com"
    assert user.id is not None

@pytest.mark.asyncio
async def test_background_task_service_decomposition(async_session):
    """Test decomposed services work together."""
    # Test individual services
    token_service = TokenRefreshService(async_session)
    data_collector = DataCollector(token_service)
    coordinator = AnalysisCoordinator(async_session)

    # Test coordination
    with patch.object(data_collector, 'fetch_user_data') as mock_fetch:
        mock_fetch.return_value = {"test": "data"}
        result = await coordinator.analyze_user_data(user_id=1)
        assert result is not None
```

## Authentication & Security

### OAuth Integration Pattern

#### OAuth Client Implementation
```python
# auth/oauth.py
import httpx
from urllib.parse import urlencode

class OAuthClient:
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.base_url = "https://accounts.spotify.com"  # Example

    def get_auth_url(self, scopes: list[str] | None = None) -> str:
        """Generate OAuth authorization URL."""
        params = {
            "client_id": self.client_id,
            "response_type": "code",
            "redirect_uri": self.redirect_uri,
            "scope": " ".join(scopes or []),
            "state": self._generate_state(),  # CSRF protection
        }
        return f"{self.base_url}/authorize?{urlencode(params)}"

    async def exchange_code_for_token(self, code: str) -> OAuthToken:
        """Exchange authorization code for access token."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/token",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                }
            )
            response.raise_for_status()
            return OAuthToken(**response.json())
```

### JWT Token Management

#### Token Creation and Validation
```python
# core/security.py
from datetime import UTC, datetime, timedelta
from jose import JWTError, jwt

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create JWT access token with proper expiration."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def verify_token(token: str) -> dict | None:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# FastAPI dependency for authentication
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session)
) -> User:
    """Get current authenticated user from JWT token."""
    payload = await verify_token(token)
    if not payload:
        raise HTTPException(401, "Invalid authentication credentials")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(401, "Invalid token payload")

    user = await session.get(User, int(user_id))
    if not user:
        raise HTTPException(401, "User not found")

    return user
```

## API Design Patterns

### Exception Handling

#### Exception Chaining (Mandatory)
```python
# ✅ CORRECT: Always chain exceptions
async def get_user_data(user_id: int) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"/api/users/{user_id}")
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch user data"
        ) from e  # ✅ Exception chaining

# ❌ INCORRECT: Bare except or no chaining
async def get_user_data_bad(user_id: int) -> dict:
    try:
        # ... code ...
        pass
    except:  # ❌ Bare except
        raise HTTPException(500, "Error")  # ❌ No chaining
```

#### Custom Exception Classes
```python
# core/exceptions.py
class AppException(Exception):
    """Base application exception."""
    pass

class UserNotFoundError(AppException):
    """User not found in database."""
    pass

class ExternalAPIError(AppException):
    """External API call failed."""
    pass

# Usage in services
async def get_user(user_id: int) -> User:
    user = await session.get(User, user_id)
    if not user:
        raise UserNotFoundError(f"User {user_id} not found")
    return user

# Router error handling
@router.get("/users/{user_id}")
async def get_user_endpoint(user_id: int):
    try:
        return await service.get_user(user_id)
    except UserNotFoundError as e:
        raise HTTPException(404, str(e)) from e
```

### Response Models and Validation

#### Pydantic Response Models
```python
# schemas.py
from pydantic import BaseModel, Field

class UserResponse(BaseModel):
    id: int
    email: str
    display_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    email: str = Field(..., description="User email address")
    display_name: str = Field(..., min_length=1, max_length=100)

class UserUpdate(BaseModel):
    display_name: str | None = Field(None, min_length=1, max_length=100)
    email: str | None = None

# Router with proper typing
@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    service: UserService = Depends(get_user_service)
) -> UserResponse:
    user = await service.create_user(user_data)
    return UserResponse.model_validate(user)
```

## Development Workflow

### Environment Configuration

#### Environment Variables Pattern
```python
# core/config.py
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    # Database
    database_url: str = Field(..., description="PostgreSQL connection URL")
    test_database_url: str = Field(..., description="Test database URL")

    # Security
    secret_key: str = Field(..., description="JWT secret key")
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)

    # External APIs
    oauth_client_id: str = Field(..., description="OAuth client ID")
    oauth_client_secret: str = Field(..., description="OAuth client secret")
    oauth_redirect_uri: str = Field(..., description="OAuth redirect URI")

    # Application URLs
    frontend_url: str = Field(default="https://127.0.0.1:5174")
    backend_url: str = Field(default="https://127.0.0.1:8443")

settings = Settings()
```

#### Development Environment Setup
```bash
# .env file structure
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/yourapp
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/yourapp_test

SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
OAUTH_REDIRECT_URI=https://127.0.0.1:8443/api/v1/auth/callback

FRONTEND_URL=https://127.0.0.1:5174
BACKEND_URL=https://127.0.0.1:8443
```

### Code Quality Standards

#### Ruff Configuration
```toml
# pyproject.toml
[tool.ruff]
target-version = "py313"
line-length = 88
lint.select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
    "UP", # pyupgrade
]
lint.ignore = [
    "E501",  # line too long, handled by formatter
    "B008",  # do not perform function calls in argument defaults
]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

#### Development Commands
```bash
# Backend workflow
cd backend/
uv run uvicorn src.your_project.main:app --reload  # Development server
uv run pytest                                       # Run tests
uv run pytest --cov=src --cov-report=html         # Coverage report
uv run ruff check . && uv run ruff format .       # Code quality
uv run mypy src/                                   # Type checking

# Database operations
task db:migrate:diff add_new_feature              # Generate migration
task db:migrate:apply                              # Apply migrations
```

## HTTPS Development Setup

### SSL Certificate Generation
```bash
# Generate self-signed certificate for development
openssl req -x509 -newkey rsa:4096 -keyout localhost.key -out localhost.crt \
  -days 365 -nodes -subj "/C=US/ST=Local/L=Local/O=yourapp/CN=localhost"
```

### HTTPS Server Configuration
```python
# main.py - HTTPS development server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.your_project.main:app",
        host="0.0.0.0",
        port=8443,
        reload=True,
        ssl_keyfile="certs/localhost.key",
        ssl_certfile="certs/localhost.crt"
    )
```

## Summary

This backend architecture provides:

- **🏗️ Scalable Architecture**: Domain-driven design with clear boundaries
- **🔒 Security First**: OAuth + JWT with proper token management
- **🧪 Testing Excellence**: Perfect database isolation and comprehensive coverage
- **⚡ Modern Python**: Latest patterns and best practices
- **🚀 Background Tasks**: Production-ready async task processing
- **📊 Database Excellence**: Atlas migrations with timezone-aware models
- **🔧 Developer Experience**: Excellent tooling and workflow automation

Follow these patterns for building robust, maintainable FastAPI applications with modern Python practices.
