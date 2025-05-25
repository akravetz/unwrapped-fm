// API client utilities

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:8443';

class ApiError extends Error {
  status: number;
  statusText: string;

  constructor(status: number, statusText: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new ApiError(response.status, response.statusText, errorMessage);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network Error', 'Unable to connect to the server');
    }
  }

  // Auth endpoints
  async getAuthUrl(): Promise<{ auth_url: string }> {
    return this.request<{ auth_url: string }>('/api/v1/auth/login');
  }

  async getCurrentUser(): Promise<import('../types/auth').User> {
    return this.request<import('../types/auth').User>('/api/v1/auth/me');
  }

  async getAuthStatus(): Promise<import('../types/auth').AuthStatus> {
    return this.request<import('../types/auth').AuthStatus>('/api/v1/auth/status');
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/v1/auth/logout', {
      method: 'POST',
    });
  }

  // Music analysis endpoints
  async analyzeMusic(): Promise<import('../types/analysis').AnalysisResult> {
    return this.request<import('../types/analysis').AnalysisResult>('/api/v1/music/analyze', {
      method: 'POST',
    });
  }

  async getLatestAnalysis(): Promise<import('../types/analysis').AnalysisResult> {
    return this.request<import('../types/analysis').AnalysisResult>('/api/v1/music/analysis/latest');
  }

  // Public sharing endpoints (no auth required)
  async getSharedAnalysis(shareToken: string): Promise<import('../types/analysis').PublicAnalysisResult> {
    return this.request<import('../types/analysis').PublicAnalysisResult>(`/api/v1/public/share/${shareToken}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
