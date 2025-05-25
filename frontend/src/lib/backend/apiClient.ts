import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { User, LoginResponse, AuthStatusResponse, ApiError } from '@/domains/authentication/types/auth.types';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Use HTTPS for development to match backend
    this.baseURL = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_API_URL || 'https://api.unwrapped.fm/api/v1'
      : 'https://127.0.0.1:8443/api/v1';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = Cookies.get('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear invalid token
          if (typeof window !== 'undefined') {
            Cookies.remove('auth_token');
            // Optionally redirect to login
            window.location.href = '/';
          }
        }
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private handleApiError(error: unknown): ApiError {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { data?: { detail?: string; message?: string; code?: string }; status: number } };
      return {
        message: axiosError.response.data?.detail || axiosError.response.data?.message || 'An error occurred',
        status: axiosError.response.status,
        code: axiosError.response.data?.code
      };
    } else if (error && typeof error === 'object' && 'request' in error) {
      return {
        message: 'Network error - please check your connection',
        status: 0
      };
    } else {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'An unexpected error occurred';
      return {
        message: errorMessage,
        status: 0
      };
    }
  }

  // Authentication endpoints
  async getAuthUrl(): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.client.get('/auth/login');
    return response.data;
  }

  async getAuthStatus(): Promise<AuthStatusResponse> {
    const response: AxiosResponse<AuthStatusResponse> = await this.client.get('/auth/status');
    return response.data;
  }

  async handleAuthCallback(code: string, state: string): Promise<{ access_token: string; user: User }> {
    const response = await this.client.post('/auth/callback', { code, state });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    if (typeof window !== 'undefined') {
      Cookies.remove('auth_token');
    }
  }

  async refreshToken(): Promise<{ access_token: string }> {
    const response = await this.client.post('/auth/refresh');
    return response.data;
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get('/auth/me');
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      Cookies.set('auth_token', token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
  }

  clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove('auth_token');
    }
  }

  getAuthToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return Cookies.get('auth_token');
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
