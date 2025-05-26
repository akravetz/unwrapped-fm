/**
 * Clean API client without browser API dependencies
 * All token management is handled externally
 * Can be safely used in both SSR and client-side contexts
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, LoginResponse, AuthStatusResponse, ApiError, MusicAnalysisResponse } from '@/domains/authentication/types/auth.types';

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Use environment-based URL detection (SSR-safe)
    this.baseURL = process.env.NODE_ENV === 'production'
      ? 'https://api.unwrapped.fm/api/v1'
      : 'https://127.0.0.1:8443/api/v1';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling only
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private handleApiError(error: unknown): ApiError {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { data?: { detail?: string; message?: string }; status: number } };
      return {
        message: axiosError.response.data?.detail || axiosError.response.data?.message || 'An error occurred',
        detail: axiosError.response.data?.detail || axiosError.response.data?.message || 'An error occurred'
      };
    } else if (error && typeof error === 'object' && 'request' in error) {
      return {
        message: 'Network error - please check your connection',
        detail: 'No response received from server'
      };
    } else {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'An unexpected error occurred';
      return {
        message: errorMessage,
        detail: errorMessage
      };
    }
  }

  /**
   * Make authenticated request with token
   */
  private async makeAuthenticatedRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    token?: string | null,
    data?: Record<string, unknown>
  ): Promise<T> {
    const config = {
      method: method.toLowerCase(),
      url,
      ...(data && { data }),
      ...(token && {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    };

    const response: AxiosResponse<T> = await this.client.request(config);
    return response.data;
  }

  // Authentication endpoints (no token required)
  async getAuthUrl(): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.client.get('/auth/login');
    return response.data;
  }

  async handleAuthCallback(code: string, state: string): Promise<{ access_token: string; user: User }> {
    const response = await this.client.post('/auth/callback', { code, state });
    return response.data;
  }

  // Authenticated endpoints (token required)
  async getAuthStatus(token: string): Promise<AuthStatusResponse> {
    return this.makeAuthenticatedRequest<AuthStatusResponse>('GET', '/auth/status', token);
  }

  async getCurrentUser(token: string): Promise<User> {
    return this.makeAuthenticatedRequest<User>('GET', '/auth/me', token);
  }

  async logout(token: string): Promise<void> {
    await this.makeAuthenticatedRequest<void>('POST', '/auth/logout', token);
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    return this.makeAuthenticatedRequest<{ access_token: string }>('POST', '/auth/refresh', token);
  }

  // Music analysis endpoints
  async getLatestAnalysis(token: string): Promise<MusicAnalysisResponse | null> {
    return this.makeAuthenticatedRequest<MusicAnalysisResponse | null>('GET', '/music/analysis/latest', token);
  }

  async analyzeMusic(token: string): Promise<MusicAnalysisResponse> {
    // Use longer timeout for analysis since it involves Spotify API calls + AI processing
    const config = {
      method: 'post',
      url: '/music/analyze',
      timeout: 60000, // 60 seconds for analysis
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response: AxiosResponse<MusicAnalysisResponse> = await this.client.request(config);
    return response.data;
  }

  // Health check (no auth required)
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
