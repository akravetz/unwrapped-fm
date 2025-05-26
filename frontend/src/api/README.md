# Auto-Generated TypeScript API Client

This directory contains the auto-generated TypeScript API client for the unwrapped.fm backend API.

## Setup

1. **Install dependencies** (if not already done):
   ```bash
   cd frontend
   npm install
   ```

2. **Generate the API client**:
   ```bash
   # From the project root
   task api:generate

   # Or step by step:
   task api:generate-spec    # Generate OpenAPI spec
   task api:generate-client  # Generate TypeScript client
   ```

## Directory Structure

```
src/api/
├── README.md           # This file
├── client.ts          # Wrapper service with authentication
├── openapi.json       # Generated OpenAPI specification (gitignored)
└── generated/         # Generated TypeScript types (gitignored)
    └── types.ts       # TypeScript type definitions
```

## Usage

### Basic Usage with Authentication

```typescript
import { useApiClient } from '@/api/client';

function MyComponent() {
  const apiClient = useApiClient();

  useEffect(() => {
    if (!apiClient) return; // SSR-safe check

    // All API calls are automatically authenticated
    apiClient.getCurrentUser()
      .then(user => console.log(user))
      .catch(error => console.error(error));
  }, [apiClient]);
}
```

### Direct API Access

```typescript
import { apiClient } from '@/api/client';

// Only use in client-side code (not during SSR)
if (typeof window !== 'undefined') {
  apiClient.healthCheck()
    .then(response => console.log('API is healthy'))
    .catch(error => console.error('API error:', error));
}
```

### Advanced Usage

```typescript
import { AuthenticatedApiClient } from '@/api/client';

// Custom configuration
const client = new AuthenticatedApiClient({
  baseURL: 'https://api.unwrapped.fm',
  timeout: 10000
});

// Access the underlying generated client
const rawClient = client.getClient();
```

## Authentication

The API client automatically includes JWT tokens from cookies in all requests. The token is retrieved from the `access_token` cookie.

## SSR Compatibility

The `useApiClient()` hook is SSR-safe and returns `null` during server-side rendering to prevent hydration issues. Always check for null before using:

```typescript
const apiClient = useApiClient();
if (!apiClient) return; // Handle SSR case
```

## Regenerating the Client

Whenever you update the backend API:

1. **Update the OpenAPI spec**: `task api:generate-spec`
2. **Regenerate the client**: `task api:generate-client`
3. **Update wrapper methods**: Add new methods to `client.ts` as needed

The generated files are gitignored, so each developer needs to run the generation commands locally.

## Type Safety

All API calls are fully typed based on your FastAPI backend:

- Request parameters are validated at compile time
- Response types are automatically inferred
- Enum values and validation rules are preserved
- Optional vs required fields are correctly typed

## Error Handling

The generated client throws typed errors that you can catch and handle:

```typescript
try {
  const response = await apiClient.getCurrentUser();
  const user = response.data; // Fully typed!
} catch (error) {
  if (error.response?.status === 401) {
    // Handle authentication error
  } else if (error.response?.status === 404) {
    // Handle not found
  }
}
```

## Example Component

See `example.tsx` for a complete React component demonstrating:

- SSR-safe API client usage
- Type-safe API calls with full TypeScript support
- Error handling patterns
- Loading states
- Using generated types for component state

```typescript
import type { components } from './generated/types';

type User = components['schemas']['UserRead'];
type AnalysisStatus = components['schemas']['AnalysisStatusResponse'];
```
