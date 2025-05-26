/**
 * Client-side only token service
 * Handles token storage and retrieval using browser APIs
 * Should only be used in client-side contexts (useEffect, event handlers, etc.)
 */

import Cookies from 'js-cookie';

export class TokenService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly TOKEN_EXPIRY_DAYS = 7;

  /**
   * Store authentication token
   * Uses both cookies and localStorage for redundancy
   */
  static setToken(token: string): void {
    // Store in cookies (for SSR and cross-tab sync)
    Cookies.set(this.TOKEN_KEY, token, {
      expires: this.TOKEN_EXPIRY_DAYS,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Store in localStorage as backup
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Retrieve authentication token
   * Tries cookies first, then localStorage as fallback
   */
  static getToken(): string | null {
    // Try cookies first (works with SSR)
    const cookieToken = Cookies.get(this.TOKEN_KEY);
    if (cookieToken) {
      return cookieToken;
    }

    // Fallback to localStorage
    const localToken = localStorage.getItem(this.TOKEN_KEY);
    if (localToken) {
      // Sync back to cookies if found in localStorage
      this.setToken(localToken);
      return localToken;
    }

    return null;
  }

  /**
   * Remove authentication token from all storage locations
   */
  static clearToken(): void {
    Cookies.remove(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Check if user has a stored token
   */
  static hasToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Get token for API requests
   * Returns null if no token exists
   */
  static getAuthHeader(): string | null {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }
}
