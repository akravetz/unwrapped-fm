import { robustStorage } from '@/shared/utils/storage'
import { logBrowserInfo } from '@/shared/utils/browser'

const TOKEN_KEY = 'unwrapped_auth_token'

export const tokenService = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null

    try {
      const token = robustStorage.getItem(TOKEN_KEY)
      console.log('[TokenService] getToken:', token ? 'found' : 'not found')
      return token
    } catch (error) {
      console.error('[TokenService] getToken failed:', error)
      logBrowserInfo()
      return null
    }
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return

    try {
      robustStorage.setItem(TOKEN_KEY, token)
      console.log('[TokenService] setToken: success')

      // Verify the token was stored correctly
      const storedToken = robustStorage.getItem(TOKEN_KEY)
      if (storedToken !== token) {
        console.error('[TokenService] Token verification failed after storage')
        logBrowserInfo()
      }
    } catch (error) {
      console.error('[TokenService] setToken failed:', error)
      logBrowserInfo()
      throw error
    }
  },

  removeToken(): void {
    if (typeof window === 'undefined') return

    try {
      robustStorage.removeItem(TOKEN_KEY)
      console.log('[TokenService] removeToken: success')
    } catch (error) {
      console.error('[TokenService] removeToken failed:', error)
    }
  },

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const isExpired = Date.now() >= payload.exp * 1000
      console.log('[TokenService] isTokenExpired:', isExpired)
      return isExpired
    } catch (error) {
      console.error('[TokenService] isTokenExpired failed:', error)
      return true
    }
  },

  // New method for debugging
  getStorageInfo(): {
    storageAdapter: string
    storageAvailable: boolean
    hasToken: boolean
  } {
    return {
      storageAdapter: robustStorage.getCurrentAdapterName(),
      storageAvailable: robustStorage.isAvailable(),
      hasToken: !!this.getToken()
    }
  }
}
