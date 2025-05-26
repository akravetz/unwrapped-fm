# 🛠️ Architecture Remediation Plan

## **Overview**

This document outlines a comprehensive plan to address the critical design antipatterns identified in the architecture review. The plan prioritizes high-impact, low-risk changes first while building toward a more maintainable architecture.

---

## **📋 Implementation Strategy**

### **Risk Mitigation Approach**
- ✅ **Incremental refactoring** - No big-bang rewrites
- ✅ **Backward compatibility** - Maintain existing functionality
- ✅ **Test-driven** - Ensure all changes preserve behavior
- ✅ **Feature flags** - Safe rollout of new patterns

### **Success Metrics**
- 🎯 **0 broken tests** during refactoring
- 🎯 **Improved test coverage** (+10% minimum)
- 🎯 **Reduced complexity** (measurable via pyrefly/ESLint)
- 🎯 **Better separation of concerns** (single responsibility)

---

## **🚀 Phase 1: Immediate Wins (Week 1)**

### **Priority**: 🔴 **Critical** | **Risk**: 🟢 **Low** | **Effort**: 📊 **2-3 days**

#### **1.1 Remove Duplicate API Client**
**Target**: `frontend/src/lib/backend/apiClient.ts`

**Steps**:
1. Audit all imports of legacy API client
2. Replace with new SSR-safe client
3. Remove legacy file
4. Update any remaining type imports

**Files to modify**:
- `domains/authentication/context/AuthContext.tsx` (line 5)
- Any components using legacy client

**Validation**: All auth flows work with new client

#### **1.2 Add Basic Error Boundaries**
**Target**: `frontend/src/shared/components/ErrorBoundary.tsx` (new)

**Steps**:
1. Create reusable ErrorBoundary component
2. Wrap main app in error boundary
3. Add domain-specific error boundaries
4. Implement error reporting/logging

**Implementation**:
```typescript
// shared/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  // ... implementation with proper error handling
}

// app/layout.tsx
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeRegistry>
        {children}
      </ThemeRegistry>
    </ErrorBoundary>
  );
}
```

#### **1.3 Extract Routing Logic from Main Page**
**Target**: `frontend/src/app/page.tsx`

**Steps**:
1. Create `AppRouter` component for state routing logic
2. Extract state management to custom hook
3. Simplify main page to just routing
4. Move complex conditionals to dedicated components

**New structure**:
```typescript
// app/page.tsx (simplified)
export default function HomePage() {
  return (
    <ClientWrapper>
      <AppRouter />
    </ClientWrapper>
  );
}

// components/AppRouter.tsx (new)
export function AppRouter() {
  const { currentScreen } = useAppNavigation();
  // Clean routing logic
}
```

#### **1.4 Basic Logging Infrastructure**
**Target**: `backend/src/unwrapped/core/logging.py` (new)

**Steps**:
1. Replace all `print()` statements with proper logging
2. Add structured logging configuration
3. Update error handling to use logger
4. Add request correlation IDs

---

## **🔧 Phase 2: Service Decomposition (Month 1)**

### **Priority**: 🔴 **Critical** | **Risk**: 🟡 **Medium** | **Effort**: 📊 **2-3 weeks**

#### **2.1 Break Down God Object: MusicAnalysisService**
**Target**: `backend/src/unwrapped/music/analysis_service.py`

**Decomposition Strategy**:

##### **Step 2.1.1: Create TokenRefreshService**
```python
# music/services/token_service.py (new)
class TokenRefreshService:
    def __init__(self, session: AsyncSession, spotify_client: SpotifyMusicClient):
        self.session = session
        self.spotify_client = spotify_client

    async def get_valid_access_token(self, user_id: int) -> str:
        # Extract token management logic
```

##### **Step 2.1.2: Create SpotifyDataCollector**
```python
# music/services/data_collector.py (new)
class SpotifyDataCollector:
    def __init__(self, spotify_client: SpotifyMusicClient, token_service: TokenRefreshService):
        self.spotify_client = spotify_client
        self.token_service = token_service

    async def collect_user_music_data(self, user_id: int) -> dict[str, Any]:
        # Extract data fetching logic
```

##### **Step 2.1.3: Create AnalysisCoordinator**
```python
# music/services/analysis_coordinator.py (new)
class AnalysisCoordinator:
    def __init__(self,
                 data_collector: SpotifyDataCollector,
                 ai_client: MusicAnalysisAI,
                 result_repository: AnalysisResultRepository):
        # Coordinate the analysis workflow
```

##### **Step 2.1.4: Migration Strategy**
1. Create new services alongside existing service
2. Add feature flag to use new or old implementation
3. Gradually migrate functionality
4. Update tests to use new services
5. Remove old service once migration complete

#### **2.2 Implement Dependency Injection**
**Target**: `backend/src/unwrapped/core/dependencies.py`

**Steps**:
1. Create service factory functions
2. Update routers to use dependency injection
3. Add proper lifecycle management
4. Remove global singletons

**Implementation**:
```python
# core/dependencies.py (enhanced)
def get_settings() -> Settings:
    return Settings()

def get_spotify_auth_client(settings: Settings = Depends(get_settings)) -> SpotifyAuthClient:
    return SpotifyAuthClient(settings)

def get_user_service(session: AsyncSession = Depends(get_session)) -> UserService:
    return UserService(session)

def get_token_service(
    session: AsyncSession = Depends(get_session),
    spotify_client: SpotifyMusicClient = Depends(get_spotify_music_client)
) -> TokenRefreshService:
    return TokenRefreshService(session, spotify_client)

# music/analyze_router.py (updated)
@router.post("/analyze")
async def analyze_music_taste(
    request: Request,
    user_id: int = Depends(get_current_user_id),
    analysis_coordinator: AnalysisCoordinator = Depends(get_analysis_coordinator)
) -> MusicAnalysisResponse:
    return await analysis_coordinator.analyze_user_music(user_id)
```

#### **2.3 Split Frontend AuthContext**
**Target**: `frontend/src/domains/authentication/context/AuthContext.tsx`

**Decomposition**:
1. **AuthContext**: Only authentication state
2. **AnalysisContext**: Music analysis state
3. **AppStateContext**: App-level routing state

**New structure**:
```typescript
// domains/authentication/context/AuthContext.tsx (simplified)
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// domains/music-analysis/context/AnalysisContext.tsx (new)
interface AnalysisState {
  latestAnalysis: MusicAnalysisResponse | null;
  analysisLoading: boolean;
  error: string | null;
}

// domains/shared/context/AppStateContext.tsx (new)
interface AppState {
  currentScreen: AppScreen;
  navigationHistory: AppScreen[];
}
```

---

## **🏗️ Phase 3: Architecture Modernization (Month 2-3)**

### **Priority**: 🟡 **Medium** | **Risk**: 🟡 **Medium** | **Effort**: 📊 **4-6 weeks**

#### **3.1 Repository Pattern Implementation**
**Target**: `backend/src/unwrapped/core/repositories/`

**Steps**:
1. Create repository interfaces
2. Implement concrete repositories
3. Add unit of work pattern
4. Update services to use repositories

**Structure**:
```python
# core/repositories/base.py
class Repository(Protocol[T]):
    async def get_by_id(self, id: int) -> T | None: ...
    async def create(self, entity: T) -> T: ...
    async def update(self, entity: T) -> T: ...
    async def delete(self, id: int) -> bool: ...

# core/repositories/user_repository.py
class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_spotify_id(self, spotify_id: str) -> User | None:
        # Clean repository methods
```

#### **3.2 Frontend Service Layer**
**Target**: `frontend/src/domains/*/services/`

**Steps**:
1. Create service classes for each domain
2. Move API calls from hooks to services
3. Implement proper error handling
4. Add service-level caching

**Structure**:
```typescript
// domains/authentication/services/AuthService.ts
export class AuthService {
  constructor(private apiClient: ApiClient) {}

  async login(): Promise<LoginResponse> {
    return this.apiClient.getAuthUrl();
  }

  async handleCallback(code: string, state: string): Promise<AuthResponse> {
    return this.apiClient.handleAuthCallback(code, state);
  }
}

// domains/authentication/hooks/useAuth.ts
export function useAuth() {
  const authService = useAuthService();
  // Clean hook implementation using service
}
```

#### **3.3 State Management Overhaul**
**Options Analysis**:

**Option A: Enhanced Context Pattern**
- ✅ Minimal changes required
- ✅ Already familiar to team
- ❌ Still potential for prop drilling

**Option B: Zustand**
- ✅ Simple, lightweight
- ✅ Good TypeScript support
- ✅ No prop drilling
- ❌ Additional dependency

**Recommendation**: **Zustand** for better scalability

**Implementation**:
```typescript
// domains/authentication/stores/authStore.ts
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Store implementation
}));

// domains/music-analysis/stores/analysisStore.ts
interface AnalysisStore {
  latestAnalysis: MusicAnalysisResponse | null;
  analyzeMusic: () => Promise<void>;
  isLoading: boolean;
}
```

#### **3.4 Resource Management & HTTP Client Lifecycle**
**Target**: `backend/src/unwrapped/core/http_clients.py`

**Steps**:
1. Create HTTP client factory
2. Implement proper connection pooling
3. Add lifecycle management hooks
4. Update services to use managed clients

---

## **📈 Phase 4: Advanced Patterns (Month 3+)**

### **Priority**: 🟢 **Low** | **Risk**: 🟢 **Low** | **Effort**: 📊 **4-8 weeks**

#### **4.1 Domain Events & CQRS**
- Implement domain events for analysis completion
- Separate read/write models for complex queries
- Add event sourcing for audit trails

#### **4.2 Microservice Preparation**
- Complete domain isolation
- Add API versioning
- Implement service contracts
- Add distributed tracing

#### **4.3 Performance Optimization**
- Add Redis caching layer
- Implement background job processing
- Add database query optimization
- Front-end code splitting

---

## **🧪 Testing Strategy**

### **Test Migration Plan**
1. **Preserve existing tests** - No test should break during refactoring
2. **Add service tests** - Unit test new service layer
3. **Integration tests** - Test service interactions
4. **E2E tests** - Validate user workflows

### **Testing Pattern for Each Phase**
```python
# Before refactoring
def test_existing_functionality():
    # Capture current behavior

# During refactoring
def test_new_service():
    # Test new service in isolation

def test_integration():
    # Test new service with existing code

# After refactoring
def test_end_to_end():
    # Validate complete workflow
```

---

## **📊 Monitoring & Rollback Plan**

### **Health Checks**
- Add endpoint monitoring for each refactored service
- Track error rates and response times
- Monitor memory usage and connection pools

### **Feature Flags**
```python
# core/feature_flags.py
class FeatureFlags:
    USE_NEW_ANALYSIS_SERVICE = os.getenv('USE_NEW_ANALYSIS_SERVICE', 'false').lower() == 'true'
    USE_NEW_AUTH_CONTEXT = os.getenv('USE_NEW_AUTH_CONTEXT', 'false').lower() == 'true'

# music/analyze_router.py
if FeatureFlags.USE_NEW_ANALYSIS_SERVICE:
    return await new_analysis_coordinator.analyze(user_id)
else:
    return await legacy_analysis_service.analyze(user_id)
```

### **Rollback Strategy**
1. **Immediate rollback** - Feature flag toggle
2. **Gradual rollback** - Percentage-based routing
3. **Emergency rollback** - Git revert + deploy

---

## **📅 Timeline Summary**

| Phase | Duration | Key Deliverables | Risk Level |
|-------|----------|------------------|------------|
| Phase 1 | Week 1 | API client cleanup, Error boundaries, Basic logging | 🟢 Low |
| Phase 2 | Month 1 | Service decomposition, DI, Context splitting | 🟡 Medium |
| Phase 3 | Month 2-3 | Repository pattern, Service layer, State management | 🟡 Medium |
| Phase 4 | Month 3+ | Advanced patterns, Performance optimization | 🟢 Low |

---

## **🎯 Success Criteria**

### **Technical Metrics**
- ✅ **Test coverage**: Maintain >60%, target 80%
- ✅ **Complexity reduction**: Reduce cyclomatic complexity by 30%
- ✅ **Performance**: No regression in response times
- ✅ **Error rates**: <1% error rate during migration

### **Architecture Quality**
- ✅ **Single Responsibility**: Each service has one clear purpose
- ✅ **Dependency Injection**: No direct instantiation in business logic
- ✅ **Error Handling**: Consistent, logged, recoverable
- ✅ **Testability**: Each component can be tested in isolation

### **Developer Experience**
- ✅ **Reduced debugging time**: Clear error messages and logging
- ✅ **Faster feature development**: Reusable services and components
- ✅ **Easier onboarding**: Clear separation of concerns
- ✅ **Better code reviews**: Smaller, focused changes

---

## **💡 Implementation Notes**

### **Development Workflow**
1. **Create feature branch** for each major refactoring
2. **Small, atomic commits** with clear messages
3. **Code review** focused on architecture improvements
4. **Staged deployment** with monitoring

### **Communication Plan**
- **Weekly progress updates** on refactoring status
- **Demo sessions** for major architecture changes
- **Documentation updates** as patterns evolve
- **Team training** on new patterns and tools

### **Risk Mitigation**
- **Pair programming** for complex refactoring
- **Architecture decision records** (ADRs) for major changes
- **Regular checkpoint reviews** to validate approach
- **Backup plans** for each risky change

This plan provides a roadmap to transform the current codebase from rapid prototype patterns to a maintainable, scalable architecture while minimizing risk and maintaining functionality throughout the process.
