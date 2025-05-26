# SSR Architecture - unwrapped.fm

## MANDATORY: Server-Side Rendering Compatible Architecture

### Critical Rule: NO WINDOW CHECKS
**NEVER use `typeof window !== 'undefined'` anywhere in the codebase**

This is an anti-pattern that indicates architectural problems:
- Server-Side Rendering (SSR) issues with browser API access
- Singleton anti-pattern trying to access browser APIs during module initialization
- Mixed server/client responsibilities in same class
- Potential hydration mismatches in React

## Required Architecture Pattern

### 1. Clean API Client (Pure HTTP)
```typescript
// src/lib/api/apiClient.ts
export class ApiClient {
  // ✅ NO browser API access
  // ✅ Tokens passed as explicit parameters
  async getCurrentUser(token: string): Promise<User> {
    return this.makeAuthenticatedRequest('GET', '/auth/me', token);
  }
}
```

### 2. Token Service (Browser APIs Only)
```typescript
// src/lib/tokens/tokenService.ts
export class TokenService {
  // ✅ Client-side only, no defensive checks needed
  static setToken(token: string): void {
    Cookies.set('auth_token', token, { expires: 7 });
    localStorage.setItem('auth_token', token);
  }

  static getToken(): string | null {
    return Cookies.get('auth_token') || localStorage.getItem('auth_token');
  }
}
```

### 3. SSR-Safe Hook (Combines Both)
```typescript
// src/domains/authentication/hooks/useApiClient.ts
export function useApiClient(): AuthenticatedApiClient | null {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // ✅ Only runs on client
  }, []);

  if (!isClient) {
    return null; // ✅ SSR-safe: returns null during server rendering
  }

  return {
    getCurrentUser: async () => {
      const token = TokenService.getToken();
      if (!token) throw new Error('No authentication token');
      return apiClient.getCurrentUser(token); // ✅ Explicit token passing
    },
    // ... other methods
  };
}
```

### 4. Component Usage Pattern
```typescript
// ✅ REQUIRED: Always check for null apiClient
function MyComponent() {
  const apiClient = useApiClient();

  useEffect(() => {
    if (!apiClient) return; // ✅ SSR-safe guard

    // ✅ Explicit token management, no hidden window checks
    apiClient.getCurrentUser().then(setUser);
  }, [apiClient]);

  // ✅ Handle loading state during SSR
  if (!apiClient) {
    return <div>Loading...</div>; // Or null, or skeleton
  }

  return <div>Content</div>;
}
```

## Benefits of This Architecture

### ✅ SSR Compatibility
- No hydration mismatches
- Clean server-side rendering
- No defensive window checks

### ✅ Clear Separation of Concerns
- HTTP client: Pure API communication
- Token service: Browser API management
- Hook: SSR-safe combination

### ✅ Better Testing
- Easy to mock individual services
- No browser API dependencies in tests
- Clear dependency injection

### ✅ Type Safety
- Explicit token requirements
- No hidden state dependencies
- Clear error handling

## Implementation Status

### ✅ Completed
- Clean API client (`src/lib/api/apiClient.ts`)
- Token service (`src/lib/tokens/tokenService.ts`)
- SSR-safe hook (`src/domains/authentication/hooks/useApiClient.ts`)
- AuthContext refactored
- LoadingScreen refactored
- Migration documentation

### 🔄 In Progress
- TypeScript configuration fixes
- Complete component migration
- Remove legacy apiClient files

### ⏳ Next Steps
1. Fix import path resolution
2. Update remaining components
3. Remove old window-check patterns
4. Test SSR functionality

## Migration Checklist

For each component that needs updating:

1. **Replace old import**:
   ```typescript
   // ❌ OLD
   import apiClient from '@/lib/backend/apiClient';

   // ✅ NEW
   import { useApiClient } from '@/domains/authentication/hooks/useApiClient';
   ```

2. **Add hook usage**:
   ```typescript
   function MyComponent() {
     const apiClient = useApiClient();
     // ...
   }
   ```

3. **Add null checks**:
   ```typescript
   useEffect(() => {
     if (!apiClient) return; // Always check
     // ... use apiClient
   }, [apiClient]);
   ```

4. **Handle SSR state**:
   ```typescript
   if (!apiClient) {
     return <LoadingState />; // Or appropriate fallback
   }
   ```

## Verification Commands

```bash
# Check for remaining window checks (should be 0)
grep -r "typeof window" src/

# Check for old apiClient imports (should be 0)
grep -r "@/lib/backend/apiClient" src/

# Find components that need updating
find src -name "*.tsx" -exec grep -l "apiClient" {} \;
```

## Future Development Rules

### ✅ ALWAYS
- Use the SSR-safe hook pattern for API access
- Check for null apiClient before using
- Pass tokens explicitly as parameters
- Separate HTTP operations from browser APIs

### ❌ NEVER
- Use `typeof window !== 'undefined'` checks
- Access browser APIs directly in HTTP clients
- Hide token management in interceptors
- Mix server and client responsibilities

This architecture ensures Next.js SSR compatibility and creates a cleaner, more maintainable codebase.
