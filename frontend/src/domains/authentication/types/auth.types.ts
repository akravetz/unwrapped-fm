export interface User {
  id: string
  email: string
  display_name: string | null
  spotify_id: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: () => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface SpotifyAuthResponse {
  authorization_url: string
}
