/**
 * UI Copy and Text Constants
 * Centralized location for all user-facing text
 */

export const COPY = {
  // Brand
  APP_NAME: 'Unwrapped.fm',

  // Authentication
  AUTH: {
    LOGIN_BUTTON: 'Judge Me',
    LOGIN_BUTTON_CONNECTING: 'Connecting...',
    TAGLINE: 'Your friends think your taste in music is trash. Connect to your Spotify and we\'ll be the judge of that.',
    OAUTH_DISCLAIMER: 'We do not store any of your listening data. We use it to judge you and then throw it away.',
  },

  // Loading Screen
  LOADING: {
    MESSAGES: [
      "Compiling a list of breakup songs you played unironically...",
      "Checking if that one track was a joke. It wasn't...",
      "I bet you used to make a lot of mix tapes...",
      "Tuning in to your questionable life choices...",
      "Finding a rhyme for 'musical embarrassment'...",
      "Cross-referencing your top artists with community service records...",
      "Interpreting your taste through the lens of someone who's heard good music..."
    ],
    COMPLETION_MESSAGE: "Results are ready →",
    MESSAGE_DURATION: 2000, // 1 second per message
    DEFAULT_MESSAGE: 'Analyzing your music...',
    PROGRESS_DESCRIPTION: 'This may take a few minutes while we analyze your listening history and generate insights.',
  },

  // Results Screen
  RESULTS: {
    TITLE: 'Your Music Analysis',
    SHARE_BUTTON: 'Share Results',
    COPY_SUCCESS: 'Share link copied to clipboard!',
    MUSIC_TASTE_SECTION: 'Music Taste Analysis',
    POSITION_LABEL: 'Position',
    CHART_AXES: {
      HORIZONTAL: {
        LEFT: "Critically Acclaimed",
        RIGHT: "Critically Concerning"
      },
      VERTICAL: {
        TOP: "Music Snob",
        BOTTOM: "Chart Goblin"
      }
    },
  },

  // Error Messages
  ERRORS: {
    GENERIC: 'Something went wrong',
    GENERIC_DESCRIPTION: 'We encountered an unexpected error. Please try refreshing the page.',
    TRY_AGAIN: 'Try Again',
    REFRESH_PAGE: 'Refresh Page',
    AUTH_FAILED: 'Authentication failed. Please try again.',
  },

  // Navigation
  NAVIGATION: {
    ANALYZE_AGAIN: 'Analyze Again',
    JUDGE_SOMEONE_ELSE: 'Judge Someone Else',
  }
} as const

// Type for intellisense
export type CopyKeys = typeof COPY
