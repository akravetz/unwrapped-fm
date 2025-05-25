import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { AuthContextType, AuthState, User } from '../types/auth';
import { apiClient } from '../utils/api';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    handleAuthCallback();
  }, [location.search]);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Verify token and get user info
      const user = await apiClient.getCurrentUser();
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    }
  };

  const handleAuthCallback = () => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      // Store token and update state
      localStorage.setItem('auth_token', token);
      setAuthState(prev => ({
        ...prev,
        token,
        isAuthenticated: true,
        error: null,
      }));

      // Clear URL parameters and navigate to home
      navigate('/', { replace: true });

      // Fetch user data
      fetchUserData();
    } else if (error) {
      setAuthState(prev => ({
        ...prev,
        error: getErrorMessage(error),
        isLoading: false,
      }));

      // Clear URL parameters
      navigate('/', { replace: true });
    }
  };

  const fetchUserData = async () => {
    try {
      const user = await apiClient.getCurrentUser();
      setAuthState(prev => ({
        ...prev,
        user,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to load user information',
        isLoading: false,
      }));
    }
  };

  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const { auth_url } = await apiClient.getAuthUrl();

      // Redirect to Spotify OAuth
      window.location.href = auth_url;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      }));
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await apiClient.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('auth_token');
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });

      // Navigate to home page
      navigate('/', { replace: true });
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'access_denied':
        return 'Spotify access was denied. Please try again.';
      case 'authentication_failed':
        return 'Authentication failed. Please try again.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
