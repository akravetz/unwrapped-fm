import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { User, LoginResponse, AuthStatusResponse, ApiError } from '@/domains/authentication/types/auth.types';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Use HTTPS for development to match backend
    this.baseURL = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_API_URL || 'https://api.unwrapped.fm'
      : 'https://127.0.0.1:8443';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      // Allow self-signed certificates in development
      ...(process.env.NODE_ENV !== 'production' && {
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false,
        }),
      }),
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
          // Token expired or invalid
          this.clearToken();
          window.location.href = '/';
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get('auth_token') || localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    Cookies.set('auth_token', token, { expires: 7, secure: true, sameSite: 'strict' });
    localStorage.setItem('auth_token', token);
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    Cookies.remove('auth_token');
    localStorage.removeItem('auth_token');
  }

  private formatError(error: any): ApiError {
    if (error.response?.data?.detail) {
      return {
        detail: error.response.data.detail,
        status: error.response.status,
      };
    }
    return {
      detail: error.message || 'An unexpected error occurred',
      status: error.response?.status,
    };
  }

  // Authentication endpoints
  async login(): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.client.get('/api/v1/auth/login');
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get('/api/v1/auth/me');
    return response.data;
  }

  async getAuthStatus(): Promise<AuthStatusResponse> {
    const response: AxiosResponse<AuthStatusResponse> = await this.client.get('/api/v1/auth/status');
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/v1/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  // Token management
  setAuthToken(token: string): void {
    this.setToken(token);
  }

  clearAuthToken(): void {
    this.clearToken();
  }

  getAuthToken(): string | null {
    return this.getToken();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
