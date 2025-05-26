/**
 * SSR-safe API client hook
 * Combines the clean API client with token management
 * Only works on client-side, returns null during SSR
 */

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/apiClient';
import { TokenService } from '@/lib/tokens/tokenService';
import { User, LoginResponse, AuthStatusResponse, MusicAnalysisResponse } from '@/domains/authentication/types/auth.types';

export interface AuthenticatedApiClient {
  // Authentication methods
  getAuthUrl: () => Promise<LoginResponse>;
  handleAuthCallback: (code: string, state: string) => Promise<{ access_token: string; user: User }>;
  getAuthStatus: () => Promise<AuthStatusResponse>;
  getCurrentUser: () => Promise<User>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<{ access_token: string }>;

  // Music analysis methods
  getLatestAnalysis: () => Promise<MusicAnalysisResponse | null>;
  analyzeMusic: () => Promise<MusicAnalysisResponse>;

  // Token management
  setAuthToken: (token: string) => void;
  clearAuthToken: () => void;
  getAuthToken: () => string | null;
  hasToken: () => boolean;

  // Health check
  healthCheck: () => Promise<boolean>;
}

export function useApiClient(): AuthenticatedApiClient | null {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Return null during SSR
  }

  return {
    // Authentication methods (auto-inject token where needed)
    getAuthUrl: () => apiClient.getAuthUrl(),
    handleAuthCallback: (code: string, state: string) => apiClient.handleAuthCallback(code, state),
    getAuthStatus: async () => {
      const token = TokenService.getToken();
      if (!token) throw new Error('No authentication token');
      return apiClient.getAuthStatus(token);
    },
    getCurrentUser: async () => {
      const token = TokenService.getToken();
      if (!token) throw new Error('No authentication token');
      return apiClient.getCurrentUser(token);
    },
    logout: async () => {
      const token = TokenService.getToken();
      if (token) {
        try {
          await apiClient.logout(token);
        } catch (error) {
          console.error('Logout API call failed:', error);
        }
      }
      TokenService.clearToken();
    },
    refreshToken: async () => {
      const token = TokenService.getToken();
      if (!token) throw new Error('No authentication token');
      return apiClient.refreshToken(token);
    },

    // Music analysis methods
    getLatestAnalysis: async () => {
      const token = TokenService.getToken();
      if (!token) throw new Error('No authentication token');
      return apiClient.getLatestAnalysis(token);
    },
    analyzeMusic: async () => {
      const token = TokenService.getToken();
      if (!token) throw new Error('No authentication token');
      return apiClient.analyzeMusic(token);
    },

    // Token management
    setAuthToken: (token: string) => TokenService.setToken(token),
    clearAuthToken: () => TokenService.clearToken(),
    getAuthToken: () => TokenService.getToken(),
    hasToken: () => TokenService.hasToken(),

    // Health check
    healthCheck: () => apiClient.healthCheck(),
  };
}
