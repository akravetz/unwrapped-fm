export interface AnalysisResult {
  rating_text: string;           // e.g., "HIPSTER TRASH"
  rating_description: string;    // Full AI analysis description
  x_axis_pos: number;           // Position on graph (-1.0 to 1.0)
  y_axis_pos: number;           // Position on graph (-1.0 to 1.0)
  analyzed_at: string;          // ISO timestamp
  share_token: string;          // Token for sharing analysis publicly
  spotify_profile_url?: string; // Optional Spotify profile link
}

export interface PublicAnalysisResult {
  rating_text: string;           // e.g., "HIPSTER TRASH"
  rating_description: string;    // Full AI analysis description
  x_axis_pos: number;           // Position on graph (-1.0 to 1.0)
  y_axis_pos: number;           // Position on graph (-1.0 to 1.0)
  analyzed_at: string;          // ISO timestamp
}

export interface AnalysisState {
  stage: 'login' | 'loading' | 'results' | 'error';
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  loadingMessages: string[];
  currentMessageIndex: number;
  error: string | null;
  progress: number; // 0-100 for progress indication
}

export interface AnalysisContextType extends AnalysisState {
  startAnalysis: () => Promise<void>;
  resetAnalysis: () => void;
  clearError: () => void;
  nextLoadingMessage: () => void;
}

// Loading messages that rotate during analysis
export const LOADING_MESSAGES = [
  "Compiling a list of breakup songs you played unironically...",
  "Checking if that one track was a joke. It wasn't...",
  "I bet you used to make a lot of mix tapes...",
  "Tuning in to your questionable life choices...",
  "Finding a rhyme for 'musical embarrassment'...",
  "Cross-referencing your top artists with community service records...",
  "Interpreting your taste through the lens of someone who's heard good music...",
  "Calculating your proximity to basic...",
  "Determining if you're a algorithm victim...",
  "Analyzing your commitment to being different...",
];
