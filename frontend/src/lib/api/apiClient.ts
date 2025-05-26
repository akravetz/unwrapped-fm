import { tokenService } from '../tokens/tokenService'
import type { User, LoginResponse, SpotifyAuthResponse } from '@/domains/authentication/types/auth.types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://127.0.0.1:8443'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class AuthenticatedApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = tokenService.getToken()

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.detail || 'An error occurred',
        response.status,
        errorData
      )
    }

    return response.json()
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/v1/auth/me')
  }

  async getSpotifyAuthUrl(): Promise<SpotifyAuthResponse> {
    return this.request<SpotifyAuthResponse>('/api/v1/auth/login')
  }

  async handleAuthCallback(code: string, state: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/v1/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    })
  }

  async logout(): Promise<void> {
    await this.request('/api/v1/auth/logout', { method: 'POST' })
  }
}

export const apiClient = new AuthenticatedApiClient()
