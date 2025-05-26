# AI Music Analysis with DeepSeek

This document explains the AI-powered music taste analysis feature that uses DeepSeek's API to generate witty, sarcastic roasts of users' Spotify listening habits.

## Overview

The AI analysis feature replaces the previous mock analysis with real AI-generated insights. It analyzes comprehensive Spotify data and generates personalized, humorous commentary about users' music taste.

## Architecture

### Components

1. **`MusicAnalysisAI`** (`src/unwrapped/music/ai_client.py`)
   - Handles communication with DeepSeek API
   - Processes music data into AI-friendly summaries
   - Validates and formats AI responses

2. **`MusicAnalysisService`** (`src/unwrapped/music/analysis_service.py`)
   - Orchestrates the analysis process
   - Integrates AI client with fallback logic
   - Manages database storage

3. **Configuration** (`src/unwrapped/core/config.py`)
   - DeepSeek API key and base URL settings
   - Environment-based configuration

### Data Flow

```
Spotify Data → Music Summary → AI Prompt → DeepSeek API → JSON Response → Validation → Database
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# AI Configuration (DeepSeek)
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

### Getting a DeepSeek API Key

1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Create an account and verify your email
3. Navigate to API Keys section
4. Generate a new API key
5. Add the key to your environment variables

## AI Analysis Process

### 1. Music Data Collection

The system collects comprehensive Spotify data:
- Top tracks (short/medium/long term)
- Top artists (short/medium/long term)
- Recently played tracks
- Audio features (energy, valence, danceability, etc.)

### 2. Data Summarization

Raw Spotify data is processed into a structured summary:
- Track and artist counts
- Genre analysis
- Popularity statistics
- Audio feature averages
- Listening patterns across time periods

### 3. AI Prompt Generation

Two prompts are created:

**System Prompt**: Defines the AI's personality as a witty, sarcastic music critic

**User Prompt**: Contains the music data summary with specific metrics and patterns

### 4. DeepSeek API Call

The AI generates a JSON response with:
- `rating_text`: Short, punchy label (e.g., "BASIC MAINSTREAM")
- `rating_description`: Longer sarcastic analysis (100-200 words)
- `x_axis_pos`: Position on mainstream (-1.0) to alternative (1.0) axis
- `y_axis_pos`: Position on negative (-1.0) to positive (1.0) axis

### 5. Response Validation

The system validates:
- JSON format correctness
- Required field presence
- Axis position ranges (-1.0 to 1.0)

## Fallback Strategy

If the AI analysis fails for any reason, the system gracefully falls back to an enhanced mock analysis that:
- Uses the same music data
- Applies rule-based logic
- Generates witty descriptions
- Maintains the same response format

## Error Handling

The system handles various failure scenarios:
- API connectivity issues
- Invalid API keys
- Malformed JSON responses
- Missing required fields
- Rate limiting

All errors are logged and the fallback analysis ensures users always receive results.

## Testing

Comprehensive tests cover:
- Successful AI responses
- Error scenarios (empty response, invalid JSON, missing fields)
- Axis position clamping
- Music data summarization
- Prompt generation

Run tests with:
```bash
uv run pytest tests/test_ai_client.py -v
```

## Example AI Response

```json
{
    "rating_text": "NOSTALGIC MILLENNIAL",
    "rating_description": "Your Spotify looks like a 2010s time capsule that someone accidentally left in a coffee shop. You're still emotionally attached to bands that peaked when skinny jeans were cool, and your 'discover weekly' is just Spotify gently suggesting you might want to try something from this decade. The fact that you have both indie folk and pop-punk in your top genres tells me you're having an identity crisis that started in college and never quite resolved.",
    "x_axis_pos": 0.2,
    "y_axis_pos": -0.3
}
```

## Performance Considerations

- **Token Usage**: Prompts are optimized to stay within reasonable token limits
- **Response Time**: Typical API calls complete in 2-5 seconds
- **Rate Limiting**: DeepSeek has generous rate limits for most use cases
- **Caching**: Results are stored in the database to avoid repeated analysis

## Cost Management

- DeepSeek offers competitive pricing compared to other AI providers
- Token usage is optimized through efficient prompt design
- Fallback analysis ensures no failed requests waste tokens
- Consider implementing usage monitoring for production deployments

## Monitoring

Key metrics to monitor:
- AI analysis success rate
- Average response time
- Token usage per analysis
- Fallback analysis frequency

## Future Enhancements

Potential improvements:
- Multiple AI model support
- User preference-based prompt customization
- Analysis result caching and versioning
- Advanced music pattern recognition
- Collaborative filtering insights
