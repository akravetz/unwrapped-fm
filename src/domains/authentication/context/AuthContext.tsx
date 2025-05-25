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
      return {
        ...state,
        isLoading: true,
        error: null,
      };
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
        ...initialState,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
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

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Handle URL parameters (OAuth callback)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      // OAuth success - store token and get user
      apiClient.setAuthToken(token);
      fetchCurrentUser();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      // OAuth error
      dispatch({ type: 'AUTH_FAILURE', payload: `Authentication failed: ${error}` });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const initializeAuth = async () => {
    try {
      const existingToken = apiClient.getAuthToken();
      if (!existingToken) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Verify token is still valid
      await fetchCurrentUser();
    } catch (error) {
      // Token is invalid
      apiClient.clearAuthToken();
      dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
    }
  };

  const fetchCurrentUser = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      const user = await apiClient.getCurrentUser();
      const token = apiClient.getAuthToken();

      if (token) {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } else {
        throw new Error('No token found');
      }
    } catch (error) {
      const apiError = error as ApiError;
      dispatch({ type: 'AUTH_FAILURE', payload: apiError.detail });
    }
  };

  const login = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiClient.login();

      // Redirect to Spotify OAuth
      window.location.href = response.auth_url;
    } catch (error) {
      const apiError = error as ApiError;
      dispatch({ type: 'AUTH_FAILURE', payload: apiError.detail });
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      apiClient.clearAuthToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshToken = async () => {
    // For now, just re-fetch user data to verify token
    await fetchCurrentUser();
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

export default AuthContext;
