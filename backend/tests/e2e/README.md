# End-to-End Tests

This directory contains comprehensive end-to-end tests for the unwrapped.fm backend API.

## Overview

The e2e tests verify the complete music analyzer workflow by:

1. **Spinning up a test database** using PostgreSQL in Docker (via testcontainers)
2. **Seeding test data** including users with Spotify tokens
3. **Testing the full API workflow** from analysis begin to completion
4. **Mocking external services** (Spotify API, AI analysis) for reliable testing

## Test Coverage

### `test_music_analyzer_workflow.py`

**TestMusicAnalyzerWorkflow** - Comprehensive tests for the music analysis background task system:

1. **`test_complete_music_analysis_workflow`** - Tests the happy path:
   - Begin analysis → Poll status → Get results
   - Verifies all API responses and data integrity
   - Tests background task completion

2. **`test_idempotent_begin_analysis`** - Tests idempotency:
   - Multiple calls to begin return the same analysis
   - Ensures no duplicate analyses are created

3. **`test_analysis_error_handling`** - Tests error scenarios:
   - Handles Spotify API failures gracefully
   - Returns fallback analysis when data is unavailable

4. **`test_authentication_required`** - Tests security:
   - All endpoints require valid JWT tokens
   - Returns 401 for unauthenticated requests

5. **`test_no_analysis_found_scenarios`** - Tests edge cases:
   - Status/result endpoints when no analysis exists
   - Proper 404 responses

6. **`test_analysis_with_existing_user_data`** - Tests with real user data:
   - Uses users with existing Spotify tokens
   - Verifies token refresh mechanisms

## Architecture

### Database Setup
- Uses **testcontainers** for isolated PostgreSQL instances
- **Atlas migrations** applied automatically (with SQLModel fallback)
- Each test gets a fresh database state

### Mocking Strategy
- **Spotify API**: Mocked to return predictable test data
- **AI Analysis**: Mocked to return consistent analysis results
- **Background Tasks**: Run synchronously in tests for deterministic results

### Test Isolation
- Each test creates its own user to avoid conflicts
- Database transactions ensure clean state between tests
- No shared state between test methods

## Running the Tests

```bash
# Run all e2e tests
uv run pytest tests/e2e/ -v

# Run specific test
uv run pytest tests/e2e/test_music_analyzer_workflow.py::TestMusicAnalyzerWorkflow::test_complete_music_analysis_workflow -v

# Run with coverage
uv run pytest tests/e2e/ --cov=src --cov-report=html
```

## Key Benefits

1. **Full Integration Testing**: Tests the complete API workflow end-to-end
2. **Database Verification**: Ensures data persistence and consistency
3. **Background Task Testing**: Verifies async processing works correctly
4. **Error Handling**: Tests failure scenarios and recovery
5. **Authentication**: Verifies security across all endpoints
6. **Realistic Scenarios**: Uses actual API request/response patterns

## Dependencies

- **testcontainers**: For PostgreSQL test database
- **httpx**: For async HTTP client testing
- **pytest-asyncio**: For async test support
- **unittest.mock**: For mocking external services

The e2e tests complement the existing unit tests by providing confidence that the entire system works together correctly in a production-like environment.
