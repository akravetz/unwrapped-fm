'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthContextType, User, ApiError } from '../types/auth.types';
import apiClient from '@/lib/backend/apiClient';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount (client-side only)
  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') return;
    checkAuthStatus();
  }, []);

  // Handle URL callback parameters
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);

    // Check for direct token from backend (new flow)
    const token = urlParams.get('token');
    if (token) {
      handleTokenCallback(token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Check for Spotify OAuth callback (original flow)
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    if (code && state) {
      handleAuthCallback(code, state);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Ensure we're on client side
      if (typeof window === 'undefined') {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const token = apiClient.getAuthToken();
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const response = await apiClient.getAuthStatus();
      if (response.authenticated && response.user) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.user, token }
        });
      } else {
        apiClient.clearAuthToken();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      apiClient.clearAuthToken();
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleTokenCallback = async (token: string) => {
    try {
      dispatch({ type: 'AUTH_START' });

      // Store the token
      apiClient.setAuthToken(token);

      // Get user info with the token
      const user = await apiClient.getCurrentUser();
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
    } catch (error) {
      console.error('Token callback failed:', error);
      const apiError = error as ApiError;
      dispatch({ type: 'AUTH_FAILURE', payload: apiError.message });
      apiClient.clearAuthToken();
    }
  };

  const handleAuthCallback = async (code: string, state: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiClient.handleAuthCallback(code, state);

      apiClient.setAuthToken(response.access_token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.access_token }
      });
    } catch (error) {
      const apiError = error as ApiError;
      dispatch({ type: 'AUTH_FAILURE', payload: apiError.message });
    }
  };

  const login = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiClient.getAuthUrl();

      // Redirect to Spotify OAuth (only on client side)
      if (typeof window !== 'undefined') {
        window.location.href = response.auth_url;
      }
    } catch (error) {
      const apiError = error as ApiError;
      dispatch({ type: 'AUTH_FAILURE', payload: apiError.message });
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.clearAuthToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.refreshToken();
      apiClient.setAuthToken(response.access_token);

      // Get updated user info
      const user = await apiClient.getCurrentUser();
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: response.access_token }
      });
    } catch (error) {
      const apiError = error as ApiError;
      dispatch({ type: 'AUTH_FAILURE', payload: apiError.message });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
