# unwrapped.fm - Project Brief

## Core Vision
AI-powered music taste analysis application that judges users' Spotify listening habits with witty, brutally honest verdicts.

## Simplified Architecture (Current)
**Three-Modal Frontend Flow:**
1. **Landing Modal** - "Judge me" button to start analysis
2. **Loading Modal** - Witty messages while backend processes
3. **Results Modal** - AI verdict with quadrant graph visualization

## Core Requirements

### Authentication
- Spotify OAuth integration for user login
- JWT token management for session handling
- Automatic token refresh for seamless experience

### Music Analysis
- Fetch user's Spotify data (top tracks/artists, recently played, audio features)
- AI analysis of music taste patterns
- Generate witty rating text (e.g., "BASIC MAINSTREAM", "PRETENTIOUS HIPSTER")
- Position user on 2D quadrant graph (-1.0 to 1.0 coordinates)
- Store only analysis results, not raw music data

### Technical Stack
- **Backend**: FastAPI with Python 3.13, SQLModel, PostgreSQL
- **Frontend**: React 18 with TypeScript, Tailwind CSS
- **Database**: Atlas migrations, simplified schema
- **Testing**: pytest with 64% coverage, 50 passing tests

## Key Constraints
- **No music data storage** - fetch, analyze, return immediately
- **Minimal database** - only users and analysis results
- **Single analysis endpoint** - `/api/v1/music/analyze`
- **Production ready** - comprehensive error handling, token management

## Success Metrics
- Fast analysis (< 30 seconds)
- Entertaining AI verdicts
- Clean, maintainable codebase
- High test coverage
- Seamless user experience
