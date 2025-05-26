export interface Track {
  id: string
  name: string
  artists: Artist[]
  album: Album
  popularity: number
  duration_ms: number
  explicit: boolean
  external_urls: {
    spotify: string
  }
}

export interface Artist {
  id: string
  name: string
  genres: string[]
  popularity: number
  external_urls: {
    spotify: string
  }
}

export interface Album {
  id: string
  name: string
  artists: Artist[]
  release_date: string
  total_tracks: number
  external_urls: {
    spotify: string
  }
  images: SpotifyImage[]
}

export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface AnalysisRequest {
  timeRange: 'short_term' | 'medium_term' | 'long_term'
  includeRecentTracks: boolean
  includeTopArtists: boolean
  includeTopGenres: boolean
  includePlaylistAnalysis: boolean
}

export interface AnalysisResult {
  id: string
  user_id: string
  time_range: string
  analysis_data: Record<string, unknown>
  insights: string[]
  created_at: string
  share_token?: string
}

export interface AnalysisStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  progress: number
  message: string
  result_id?: string
}
