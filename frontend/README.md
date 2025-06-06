# Unwrapped.fm Frontend

A modern, SSR-safe React frontend built with Next.js 15, Material-UI, and TypeScript.

## Features

- **Next.js 15.3** with App Router
- **React 19** with modern hooks and patterns
- **Material-UI 7** with custom Spotify-inspired theme
- **TypeScript** with strict type checking
- **Tailwind CSS v4** for utility-first styling
- **Vitest** for unit testing
- **Playwright** for end-to-end testing
- **SSR-safe architecture** with proper hydration handling
- **Domain-driven design** with clear separation of concerns

## Architecture

### Domain Structure
```
src/
├── domains/
│   ├── authentication/     # Auth flows, user context, API client hooks
│   ├── music-analysis/     # Music data fetching and analysis UI
│   ├── results-sharing/    # Share analysis results
│   └── ui-foundation/      # Shared components, theme, utilities
├── lib/                    # Core utilities (API client, token service)
├── shared/                 # Cross-domain components and hooks
└── test/                   # Test utilities and configurations
```

### Key Patterns

- **SSR-Safe Hooks**: All browser APIs are wrapped in client-side checks
- **Authentication Context**: Centralized auth state with automatic token refresh
- **Error Boundaries**: Graceful error handling with user-friendly fallbacks
- **Type Safety**: Complete TypeScript coverage with strict typing

## Development

```bash
# Start development server
npm run dev

# Run tests
npm run test           # Unit tests with Vitest
npm run test:watch     # Watch mode
npm run test:e2e       # End-to-end tests with Playwright

# Build and deploy
npm run build          # Production build
npm run start          # Start production server

# Code quality
npm run lint           # ESLint check
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://127.0.0.1:8443
```

## API Integration

The frontend automatically uses the autogenerated API types from the backend OpenAPI schema located in `src/api/generated/`. These files should not be edited manually.

## Testing Strategy

- **Unit Tests**: Component testing with React Testing Library
- **E2E Tests**: User flow testing with Playwright
- **Type Safety**: Compile-time type checking with TypeScript
- **Linting**: Code quality enforcement with ESLint

Built with ❤️ for music lovers and data enthusiasts.
