// Authentication types matching backend models

export interface User {
  id: number;
  spotify_id: string;
  email: string;
  display_name: string | null;
  country: string | null;
  image_url: string | null;
  created_at: string;
  is_active: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthStatus {
  authenticated: boolean;
  user_id: number;
  spotify_connected: boolean;
  spotify_token_valid: boolean;
  display_name: string | null;
}
