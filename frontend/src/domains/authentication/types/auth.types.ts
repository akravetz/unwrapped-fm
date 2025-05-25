export interface User {
  id: number;
  spotify_id: string;
  display_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export interface LoginResponse {
  auth_url: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  user?: User;
}

export interface TokenResponse {
  access_token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
