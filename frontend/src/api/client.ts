import createClient from 'openapi-fetch';
import type { paths } from './generated/types';
import Cookies from 'js-cookie';

/**
 * Configuration for the API client
 */
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
}

/**
 * Authenticated API client that automatically includes JWT tokens
 */
export class AuthenticatedApiClient {
  private client: ReturnType<typeof createClient<paths>>;

  constructor(config: ApiClientConfig = {}) {
    const baseURL = config.baseURL || process.env.NEXT_PUBLIC_API_URL || 'https://127.0.0.1:8443';

    this.client = createClient<paths>({
      baseUrl: baseURL,
    });

    // Add authentication interceptor
    this.client.use({
      onRequest: ({ request }) => {
        const token = this.getAccessToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
        return request;
      },
    });
  }

  /**
   * Get the current access token from cookies
   */
  private getAccessToken(): string | undefined {
    return Cookies.get('access_token');
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get the underlying client instance for direct access
   */
  public getClient() {
    return this.client;
  }

  /**
   * Wrapper methods for common API operations
   * These will be automatically typed based on your OpenAPI spec
   */

  // Health check
  async healthCheck() {
    return this.client.GET('/health');
  }

  // Authentication endpoints
  async getCurrentUser() {
    return this.client.GET('/api/v1/auth/me');
  }

  async getSpotifyAuthUrl() {
    return this.client.GET('/api/v1/auth/login');
  }

  async handleSpotifyCallback(code: string, state?: string) {
    return this.client.GET('/api/v1/auth/callback', {
      params: {
        query: { code, ...(state && { state }) }
      }
    });
  }

  async logout() {
    return this.client.POST('/api/v1/auth/logout');
  }

  async getAuthStatus() {
    return this.client.GET('/api/v1/auth/status');
  }

  // Music analysis endpoints
  async beginMusicAnalysis() {
    return this.client.POST('/api/v1/music/analysis/begin');
  }

  async getMusicAnalysisStatus() {
    return this.client.GET('/api/v1/music/analysis/status');
  }

  async getMusicAnalysisResult() {
    return this.client.GET('/api/v1/music/analysis/result');
  }

  async getLatestMusicAnalysis() {
    return this.client.GET('/api/v1/music/analysis/latest');
  }

  async getSharedAnalysis(shareToken: string) {
    return this.client.GET('/api/v1/public/share/{share_token}', {
      params: {
        path: { share_token: shareToken }
      }
    });
  }

  // Add more wrapper methods as your API grows
  // The TypeScript types will be automatically generated from your OpenAPI spec
}

/**
 * SSR-safe hook for getting the API client
 * Returns null during SSR to prevent hydration issues
 */
export function useApiClient(): AuthenticatedApiClient | null {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return null;
  }

  // Create and return the client
  return new AuthenticatedApiClient();
}

/**
 * Default API client instance for direct usage
 * Only use this in client-side code, not in SSR contexts
 */
export const apiClient = new AuthenticatedApiClient();
