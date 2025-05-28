# Frontend Best Practices
*Comprehensive guide based on unwrapped.fm project patterns*

## Technology Stack & Setup

### Core Technologies
- **Framework**: Next.js 15.3 with App Router + React 19
- **UI Library**: Material-UI 7 with custom theming
- **Styling**: Tailwind CSS v4 + Material-UI integration
- **Type Safety**: TypeScript with strict configuration
- **Testing**: Vitest (unit) + Playwright (e2e) + React Testing Library
- **Package Management**: npm with package-lock.json

### Essential Dependencies

#### Production Dependencies
```json
{
  "dependencies": {
    "@emotion/cache": "^11.14.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@mui/icons-material": "^7.1.0",
    "@mui/material": "^7.1.0",
    "@mui/material-nextjs": "^7.1.0",
    "@mui/system": "^7.1.0",
    "next": "15.3.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

#### Development Dependencies
```json
{
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4.5.0",
    "eslint": "^9",
    "eslint-config-next": "15.3.2",
    "jsdom": "^26.1.0",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^3.1.4"
  }
}
```

### Next.js Configuration

#### next.config.ts
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  typescript: {
    // Type checking happens in CI/CD pipeline
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint checking happens in CI/CD pipeline
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
```

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Architecture Patterns

### Domain-Driven Frontend Structure

#### Recommended Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main application page
│   ├── loading.tsx        # Global loading UI
│   ├── error.tsx          # Global error UI
│   └── not-found.tsx      # 404 page
├── domains/               # Domain-driven organization
│   ├── authentication/    # Auth domain
│   │   ├── components/    # Auth-specific components
│   │   ├── context/       # Auth context and providers
│   │   ├── types/         # Auth type definitions
│   │   └── index.ts       # Clean exports
│   ├── music-analysis/    # Business domain
│   │   ├── components/    # Domain components
│   │   ├── hooks/         # Domain-specific hooks
│   │   ├── types/         # Domain types
│   │   └── index.ts       # Clean exports
│   ├── results-sharing/   # Feature domain
│   │   ├── components/    # Sharing components
│   │   ├── utils/         # Sharing utilities
│   │   └── index.ts       # Clean exports
│   └── ui-foundation/     # Design system domain
│       ├── theme/         # Material-UI theme
│       ├── components/    # Reusable UI components
│       ├── utils/         # UI utilities
│       └── index.ts       # Clean exports
├── lib/                   # External integrations
│   └── backend/           # Backend API client
│       ├── apiClient.ts   # Main API client
│       ├── types.ts       # API type definitions
│       └── index.ts       # Clean exports
├── shared/                # Shared utilities
│   ├── hooks/             # Shared React hooks
│   ├── utils/             # Utility functions
│   └── constants/         # Application constants
└── test/                  # Test utilities and setup
    ├── setup.ts           # Test environment setup
    └── utils.tsx          # Test helper functions
```

#### Domain Benefits
- **🎯 Clear Boundaries**: Each domain has specific responsibilities
- **📦 Encapsulation**: Domain logic stays within domain boundaries
- **🔄 Scalability**: Easy to add new features without affecting existing code
- **🧪 Testability**: Domain-specific testing strategies
- **🔍 Maintainability**: Easy to locate and modify functionality

### SSR-Safe Architecture (Critical)

#### The SSR Problem
```typescript
// ❌ ANTI-PATTERN: Browser-only checks
function MyComponent() {
  if (typeof window !== 'undefined') {
    // This creates hydration mismatches and poor UX
    return <ClientOnlyComponent />;
  }
  return <div>Loading...</div>;
}
```

#### SSR-Safe Hook Pattern (Mandatory)
```typescript
// ✅ CORRECT: SSR-safe hook pattern
import { useState, useEffect } from 'react';

export function useApiClient(): AuthenticatedApiClient | null {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // SSR-safe: returns null during server rendering
  }

  // Client-side only: safe to access browser APIs
  const token = localStorage.getItem('auth_token');
  return new AuthenticatedApiClient(token);
}

// ✅ CORRECT: Component usage with null checks
function MyComponent() {
  const apiClient = useApiClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!apiClient) return; // Always check for null

    apiClient.getCurrentUser().then(setUser);
  }, [apiClient]);

  if (!apiClient) {
    return <div>Initializing...</div>; // Graceful SSR state
  }

  return <div>Welcome, {user?.name}</div>;
}
```

#### Authentication Context Pattern
```typescript
// domains/authentication/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // SSR-safe client detection
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Client-side authentication check
  useEffect(() => {
    if (!isClient) return;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const apiClient = new AuthenticatedApiClient(token);
          const userData = await apiClient.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isClient]);

  const login = (token: string) => {
    if (!isClient) return;

    localStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
    // Trigger user data fetch
  };

  const logout = () => {
    if (!isClient) return;

    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Smart Routing Pattern

#### Direct Flow Architecture
```typescript
// app/page.tsx - Smart routing based on authentication state
'use client';

import { useAuth } from '@/domains/authentication';
import { LoginScreen } from '@/domains/authentication/components/LoginScreen';
import { LoadingScreen } from '@/domains/music-analysis/components/LoadingScreen';
import { ResultsScreen } from '@/domains/results-sharing/components/ResultsScreen';

type AppState = 'login' | 'loading' | 'results';

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>('login');

  // Smart routing logic
  useEffect(() => {
    if (isLoading) return; // Wait for auth check

    if (!isAuthenticated) {
      setAppState('login');
      return;
    }

    // User is authenticated - check for existing analysis
    if (user?.latestAnalysis) {
      setAppState('results');
    } else {
      setAppState('loading'); // Start analysis
    }
  }, [isAuthenticated, user, isLoading]);

  // Render based on state
  switch (appState) {
    case 'login':
      return <LoginScreen />;
    case 'loading':
      return <LoadingScreen onComplete={() => setAppState('results')} />;
    case 'results':
      return <ResultsScreen analysis={user?.latestAnalysis} />;
    default:
      return <div>Loading...</div>;
  }
}
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
```

## API Client Architecture

### Type-Safe API Client

#### API Types Definition
```typescript
// lib/backend/types.ts
export interface User {
  id: number;
  email: string;
  display_name: string;
  created_at: string;
}

export interface MusicAnalysisResponse {
  id: number;
  user_id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  ai_analysis: string | null;
  music_data: Record<string, any> | null;
  analyzed_at: string | null;
  error_message: string | null;
}

export interface AnalysisStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

export interface BeginAnalysisResponse {
  analysis_id: number;
  status: string;
  message: string;
}
```

#### Authenticated API Client
```typescript
// lib/backend/apiClient.ts
class AuthenticatedApiClient {
  private baseURL: string;
  private token: string;

  constructor(token: string) {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://127.0.0.1:8443';
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api/v1${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async beginAnalysis(): Promise<BeginAnalysisResponse> {
    return this.request<BeginAnalysisResponse>('/music/analysis/begin', {
      method: 'POST',
    });
  }

  async getAnalysisStatus(): Promise<AnalysisStatusResponse> {
    return this.request<AnalysisStatusResponse>('/music/analysis/status');
  }

  async getLatestAnalysis(): Promise<MusicAnalysisResponse> {
    return this.request<MusicAnalysisResponse>('/music/analysis/latest');
  }
}

// SSR-safe hook for API client
export function useApiClient(): AuthenticatedApiClient | null {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  return new AuthenticatedApiClient(token);
}
```

### Background Task Integration

#### Real-Time Status Polling
```typescript
// domains/music-analysis/hooks/useAnalysisPolling.ts
import { useState, useEffect } from 'react';
import { useApiClient } from '@/lib/backend';

export function useAnalysisPolling() {
  const apiClient = useApiClient();
  const [status, setStatus] = useState<AnalysisStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!apiClient || !isPolling) return;

    const pollStatus = async () => {
      try {
        const statusResponse = await apiClient.getAnalysisStatus();
        setStatus(statusResponse);

        // Stop polling when completed or failed
        if (statusResponse.status === 'completed' || statusResponse.status === 'failed') {
          setIsPolling(false);
        }
      } catch (error) {
        console.error('Status polling failed:', error);
        setIsPolling(false);
      }
    };

    // Poll immediately, then every 2 seconds
    pollStatus();
    const interval = setInterval(pollStatus, 2000);

    return () => clearInterval(interval);
  }, [apiClient, isPolling]);

  const startPolling = () => setIsPolling(true);
  const stopPolling = () => setIsPolling(false);

  return { status, isPolling, startPolling, stopPolling };
}
```

#### Loading Screen with Real Analysis
```typescript
// domains/music-analysis/components/LoadingScreen.tsx
'use client';

import { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useApiClient } from '@/lib/backend';
import { useAnalysisPolling } from '../hooks/useAnalysisPolling';

interface LoadingScreenProps {
  onComplete: (analysis: MusicAnalysisResponse) => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const apiClient = useApiClient();
  const { status, isPolling, startPolling } = useAnalysisPolling();

  // Begin analysis when component mounts
  useEffect(() => {
    if (!apiClient) return;

    const beginAnalysis = async () => {
      try {
        await apiClient.beginAnalysis();
        startPolling();
      } catch (error) {
        console.error('Failed to begin analysis:', error);
      }
    };

    beginAnalysis();
  }, [apiClient, startPolling]);

  // Handle completion
  useEffect(() => {
    if (status?.status === 'completed' && apiClient) {
      apiClient.getLatestAnalysis().then(onComplete);
    }
  }, [status, apiClient, onComplete]);

  const getStatusMessage = () => {
    switch (status?.status) {
      case 'pending':
        return 'Preparing your music analysis...';
      case 'processing':
        return 'Analyzing your music taste...';
      case 'failed':
        return 'Analysis failed. Please try again.';
      default:
        return 'Starting analysis...';
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={3}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" textAlign="center">
        {getStatusMessage()}
      </Typography>
      {status?.error_message && (
        <Typography variant="body2" color="error" textAlign="center">
          {status.error_message}
        </Typography>
      )}
    </Box>
  );
}
```

## Material Design 3 Implementation

### Theme Configuration

#### Complete MD3 Theme Setup
```typescript
// domains/ui-foundation/theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1DB954', // Spotify green
      light: '#1ed760',
      dark: '#1aa34a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#191414', // Spotify black
      light: '#2a2a2a',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    // MD3 Typography Scale
    displayLarge: {
      fontSize: '3.5rem',
      fontWeight: 400,
      lineHeight: 1.12,
      letterSpacing: '-0.25px',
    },
    displayMedium: {
      fontSize: '2.8rem',
      fontWeight: 400,
      lineHeight: 1.16,
      letterSpacing: '0px',
    },
    displaySmall: {
      fontSize: '2.25rem',
      fontWeight: 400,
      lineHeight: 1.22,
      letterSpacing: '0px',
    },
    headlineLarge: {
      fontSize: '2rem',
      fontWeight: 400,
      lineHeight: 1.25,
      letterSpacing: '0px',
    },
    headlineMedium: {
      fontSize: '1.75rem',
      fontWeight: 400,
      lineHeight: 1.29,
      letterSpacing: '0px',
    },
    headlineSmall: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.33,
      letterSpacing: '0px',
    },
    titleLarge: {
      fontSize: '1.375rem',
      fontWeight: 400,
      lineHeight: 1.27,
      letterSpacing: '0px',
    },
    titleMedium: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.15px',
    },
    titleSmall: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: '0.1px',
    },
    bodyLarge: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.5px',
    },
    bodyMedium: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: '0.25px',
    },
    bodySmall: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.33,
      letterSpacing: '0.4px',
    },
    labelLarge: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: '0.1px',
    },
    labelMedium: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.33,
      letterSpacing: '0.5px',
    },
    labelSmall: {
      fontSize: '0.6875rem',
      fontWeight: 500,
      lineHeight: 1.45,
      letterSpacing: '0.5px',
    },
  },
  spacing: 4, // 4dp base unit
  shape: {
    borderRadius: 12, // MD3 rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20,
          minHeight: 48, // Touch target
          paddingX: 24,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 48, // Touch target
          minHeight: 48,
        },
      },
    },
  },
});
```

#### Theme Provider Setup
```typescript
// app/layout.tsx
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { theme } from '@/domains/ui-foundation/theme/theme';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

### MD3 Component Patterns

#### Button Hierarchy (Mandatory)
```typescript
// ✅ CORRECT: MD3 button hierarchy
<Button variant="contained" color="primary">
  Primary Action
</Button>

<Button variant="outlined" color="primary">
  Secondary Action
</Button>

<Button variant="text" color="primary">
  Tertiary Action
</Button>

// ❌ INCORRECT: Custom styling
<Button sx={{ backgroundColor: '#1976d2' }}>
  Custom Button
</Button>
```

#### Typography Usage (Mandatory)
```typescript
// ✅ CORRECT: MD3 typography variants
<Typography variant="displayLarge">
  Main Heading
</Typography>

<Typography variant="headlineMedium">
  Section Heading
</Typography>

<Typography variant="bodyLarge">
  Primary content text
</Typography>

<Typography variant="labelMedium">
  Form labels and captions
</Typography>

// ❌ INCORRECT: Custom font sizes
<Typography sx={{ fontSize: '24px' }}>
  Custom Text
</Typography>
```

#### Spacing System (Mandatory)
```typescript
// ✅ CORRECT: 4dp spacing multiples
<Box sx={{
  padding: 2,    // 8px
  margin: 3,     // 12px
  gap: 1,        // 4px
}}>
  Content
</Box>

<Stack spacing={2}>  {/* 8px spacing */}
  <Component1 />
  <Component2 />
</Stack>

// ❌ INCORRECT: Arbitrary spacing
<Box sx={{ padding: '15px', margin: '7px' }}>
  Content
</Box>
```

### Accessibility Implementation

#### Touch Targets (Mandatory)
```typescript
// ✅ CORRECT: 48px minimum touch targets
<IconButton sx={{ width: 48, height: 48 }}>
  <Icon />
</IconButton>

<Button sx={{ minHeight: 48 }}>
  Action
</Button>

// ❌ INCORRECT: Small touch targets
<IconButton sx={{ width: 24, height: 24 }}>
  <Icon />
</IconButton>
```

#### ARIA Labels and Semantic HTML
```typescript
// ✅ CORRECT: Proper ARIA labels
<Button
  aria-label="Start music analysis"
  onClick={handleAnalyze}
>
  Analyze My Music
</Button>

<TextField
  label="Email Address"
  aria-describedby="email-helper-text"
  helperText="We'll never share your email"
  id="email-helper-text"
/>

// ✅ CORRECT: Semantic HTML structure
<main>
  <section aria-labelledby="results-heading">
    <Typography variant="headlineLarge" id="results-heading">
      Your Music Analysis
    </Typography>
    {/* Content */}
  </section>
</main>
```

#### Keyboard Navigation
```typescript
// ✅ CORRECT: Keyboard navigation support
function NavigationMenu() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleSelect(selectedIndex);
        break;
    }
  };

  return (
    <List onKeyDown={handleKeyDown} tabIndex={0}>
      {items.map((item, index) => (
        <ListItem
          key={item.id}
          selected={index === selectedIndex}
          onClick={() => handleSelect(index)}
        >
          {item.label}
        </ListItem>
      ))}
    </List>
  );
}
```

## Testing Strategies

### Unit Testing with Vitest

#### Test Setup
```typescript
// test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage for SSR-safe tests
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock fetch for API tests
global.fetch = vi.fn();
```

#### Component Testing
```typescript
// domains/authentication/components/__tests__/LoginScreen.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/domains/ui-foundation/theme/theme';
import { LoginScreen } from '../LoginScreen';

function renderWithTheme(component: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
}

describe('LoginScreen', () => {
  it('renders login button with correct accessibility attributes', () => {
    renderWithTheme(<LoginScreen />);

    const loginButton = screen.getByRole('button', { name: /login with spotify/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('aria-label');
  });

  it('handles login button click', () => {
    const mockLogin = vi.fn();
    renderWithTheme(<LoginScreen onLogin={mockLogin} />);

    const loginButton = screen.getByRole('button', { name: /login with spotify/i });
    fireEvent.click(loginButton);

    expect(mockLogin).toHaveBeenCalledOnce();
  });
});
```

#### Hook Testing
```typescript
// domains/authentication/hooks/__tests__/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('handles login correctly', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login('test-token');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### E2E Testing with Playwright

#### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://127.0.0.1:5174',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true, // For development HTTPS
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'https://127.0.0.1:5174',
    reuseExistingServer: !process.env.CI,
    ignoreHTTPSErrors: true,
  },
});
```

#### E2E Test Example
```typescript
// src/test/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('complete user journey from login to results', async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // Should show login screen
    await expect(page.getByRole('button', { name: /login with spotify/i })).toBeVisible();

    // Mock OAuth flow (in real tests, you'd use test accounts)
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ auth_url: 'https://accounts.spotify.com/authorize?...' })
      });
    });

    // Click login button
    await page.getByRole('button', { name: /login with spotify/i }).click();

    // Should redirect to OAuth (mocked)
    await expect(page).toHaveURL(/accounts\.spotify\.com/);
  });

  test('accessibility compliance', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);

    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      await expect(img).toHaveAttribute('alt');
    }

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });
});
```

## Performance Optimization

### Next.js Optimization

#### Image Optimization
```typescript
import Image from 'next/image';

// ✅ CORRECT: Optimized images
<Image
  src="/album-cover.jpg"
  alt="Album cover for [Album Name]"
  width={300}
  height={300}
  priority={isAboveTheFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### Dynamic Imports
```typescript
// ✅ CORRECT: Code splitting with dynamic imports
const ResultsChart = dynamic(
  () => import('@/domains/results-sharing/components/ResultsChart'),
  {
    loading: () => <CircularProgress />,
    ssr: false, // Chart libraries often need client-side rendering
  }
);
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

### Material-UI Optimization

#### Tree Shaking
```typescript
// ✅ CORRECT: Import specific components
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// ❌ INCORRECT: Import entire library
import { Button, TextField } from '@mui/material';
```

#### Theme Optimization
```typescript
// next.config.ts - Enable package optimization
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
};
```

## Development Workflow

### Scripts Configuration
```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 5174",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Development Commands
```bash
# Frontend workflow
cd frontend/
npm run dev          # Development server with Turbopack
npm run build        # Production build
npm run test         # Unit tests
npm run test:e2e     # E2E tests
npm run lint         # ESLint checking
```

### HTTPS Development Setup
```typescript
// vite.config.ts (for Vitest)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  server: {
    https: {
      key: '../backend/certs/localhost.key',
      cert: '../backend/certs/localhost.crt',
    },
    port: 5174,
    host: true, // Enables 0.0.0.0 binding for 127.0.0.1 access
  },
});
```

## Summary

This frontend architecture provides:

- **🏗️ SSR-Safe Architecture**: Proper hydration without mismatches
- **🎨 Material Design 3**: Complete implementation with accessibility
- **🔒 Type Safety**: Full TypeScript coverage with strict configuration
- **🧪 Testing Excellence**: Unit, integration, and E2E testing strategies
- **⚡ Performance**: Optimized builds with code splitting
- **♿ Accessibility**: WCAG 2.1 AA compliance throughout
- **🔧 Developer Experience**: Excellent tooling and hot reload
- **📱 Responsive Design**: Mobile-first with proper touch targets

Follow these patterns for building modern, accessible, and performant React applications with Next.js and Material-UI.
