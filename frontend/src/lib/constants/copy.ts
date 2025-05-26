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
    OAUTH_DISCLAIMER: 'We do not store any of your listening data. We use it to analyze you and then throw it away.',
  },

  // Loading Screen
  LOADING: {
    DEFAULT_MESSAGE: 'Analyzing your music...',
    COMPLETION_INDICATOR: 'Results are ready →',
    PROGRESS_DESCRIPTION: 'This may take a few minutes while we analyze your listening history and generate insights.',
  },

  // Results Screen
  RESULTS: {
    TITLE: 'Your Music Analysis',
    SHARE_BUTTON: 'Share Results',
    COPY_SUCCESS: 'Share link copied to clipboard!',
    MUSIC_TASTE_SECTION: 'Music Taste Analysis',
    POSITION_LABEL: 'Position',
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
