# Project Brief: unwrapped.fm

## Overview
A single-page application that integrates with Spotify to analyze a user's music listening history and provides an AI-powered assessment of their music taste with shareable results.

## Core Requirements

### User Journey
1. User authenticates with Spotify OAuth
2. Application retrieves user's music listening history from the past year
3. Music data is processed and sent to OpenAI for analysis
4. AI generates a judgment/assessment of the user's music taste
5. Results are displayed in a beautiful UI
6. User can share their results via a public link

### Functional Requirements
- **Authentication**: Spotify OAuth integration
- **Data Retrieval**: Access to user's recently played tracks (last year)
- **AI Analysis**: OpenAI integration for music taste assessment
- **Results Display**: Responsive, modern UI for showing results
- **Sharing**: Generate shareable public links for results
- **Data Persistence**: Store analysis results for sharing

### Non-Functional Requirements
- **Performance**: Handle large music libraries efficiently
- **Security**: Secure OAuth flow and data handling
- **Scalability**: Support multiple concurrent users
- **Reliability**: Robust error handling and fallbacks
- **Accessibility**: WCAG 2.1 AA compliant interface

## Success Criteria
- Users can successfully authenticate with Spotify
- Music data retrieval works for various library sizes
- AI analysis produces meaningful, entertaining results
- Sharing links work reliably for public access
- Application is responsive on mobile and desktop
- >90% test coverage on backend functionality

## Constraints
- Must respect Spotify API rate limits
- OpenAI API usage should be cost-effective
- Public sharing must respect user privacy
- Application should work without requiring user registration

## Target Users
- Music enthusiasts curious about their listening habits
- Social media users who enjoy sharing personality assessments
- People interested in AI-powered content analysis

## Business Goals
- Demonstrate integration capabilities with popular APIs
- Showcase modern full-stack development practices
- Create engaging, shareable content
