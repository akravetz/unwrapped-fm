/**
 * Robust storage utility with fallbacks for mobile compatibility
 */

import { getBrowserInfo } from './browser'

export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  isAvailable(): boolean
}

class LocalStorageAdapter implements StorageAdapter {
  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('[Storage] localStorage.getItem failed:', error)
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn('[Storage] localStorage.setItem failed:', error)
      throw error
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('[Storage] localStorage.removeItem failed:', error)
    }
  }
}

class SessionStorageAdapter implements StorageAdapter {
  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) return false
      const testKey = '__storage_test__'
      sessionStorage.setItem(testKey, 'test')
      sessionStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key)
    } catch (error) {
      console.warn('[Storage] sessionStorage.getItem failed:', error)
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value)
    } catch (error) {
      console.warn('[Storage] sessionStorage.setItem failed:', error)
      throw error
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.warn('[Storage] sessionStorage.removeItem failed:', error)
    }
  }
}

class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>()

  isAvailable(): boolean {
    return true
  }

  getItem(key: string): string | null {
    return this.storage.get(key) || null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }
}

class RobustStorage {
  private adapters: StorageAdapter[]
  private currentAdapter: StorageAdapter | null = null

  constructor() {
    this.adapters = [
      new LocalStorageAdapter(),
      new SessionStorageAdapter(),
      new MemoryStorageAdapter()
    ]
    this.selectAdapter()
  }

  private selectAdapter(): void {
    for (const adapter of this.adapters) {
      if (adapter.isAvailable()) {
        this.currentAdapter = adapter
        const adapterName = adapter.constructor.name
        console.log(`[Storage] Using ${adapterName}`)

        // Log browser info for debugging
        const browserInfo = getBrowserInfo()
        if (browserInfo.isMobile) {
          console.log('[Storage] Mobile browser detected:', {
            isPrivateMode: browserInfo.isPrivateMode,
            userAgent: browserInfo.userAgent
          })
        }
        break
      }
    }

    if (!this.currentAdapter) {
      console.error('[Storage] No storage adapter available')
      this.currentAdapter = new MemoryStorageAdapter()
    }
  }

  getItem(key: string): string | null {
    if (!this.currentAdapter) return null

    try {
      const value = this.currentAdapter.getItem(key)
      console.log(`[Storage] getItem(${key}):`, value ? 'found' : 'not found')
      return value
    } catch (error) {
      console.error(`[Storage] getItem(${key}) failed:`, error)
      // Try to switch to next available adapter
      this.selectAdapter()
      return this.currentAdapter?.getItem(key) || null
    }
  }

  setItem(key: string, value: string): void {
    if (!this.currentAdapter) return

    try {
      this.currentAdapter.setItem(key, value)
      console.log(`[Storage] setItem(${key}): success`)
    } catch (error) {
      console.error(`[Storage] setItem(${key}) failed:`, error)
      // Try to switch to next available adapter
      this.selectAdapter()
      try {
        this.currentAdapter?.setItem(key, value)
        console.log(`[Storage] setItem(${key}): success with fallback adapter`)
      } catch (fallbackError) {
        console.error(`[Storage] setItem(${key}) failed with fallback:`, fallbackError)
        throw fallbackError
      }
    }
  }

  removeItem(key: string): void {
    if (!this.currentAdapter) return

    try {
      this.currentAdapter.removeItem(key)
      console.log(`[Storage] removeItem(${key}): success`)
    } catch (error) {
      console.error(`[Storage] removeItem(${key}) failed:`, error)
    }
  }

  isAvailable(): boolean {
    return this.currentAdapter?.isAvailable() || false
  }

  getCurrentAdapterName(): string {
    return this.currentAdapter?.constructor.name || 'None'
  }
}

export const robustStorage = new RobustStorage()
