'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/domains/authentication/context/AuthContext'
import { tokenService } from '@/lib/tokens/tokenService'
import { useApiClient } from '@/domains/authentication/hooks/useApiClient'

export function useAppNavigation() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const apiClient = useApiClient()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleAuthCallback = useCallback(async () => {
    if (!apiClient || !isClient) return

    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')

    if (code && state) {
      try {
        const response = await apiClient.handleAuthCallback(code, state)
        tokenService.setToken(response.access_token)
        await refreshUser()
        // Clean up URL and let smart routing handle navigation
        router.replace('/')
      } catch (error) {
        console.error('Auth callback error:', error)
        router.replace('/?error=auth_failed')
      }
    }
  }, [apiClient, refreshUser, router, isClient])

  const handleTokenFromUrl = useCallback(async () => {
    if (!apiClient || !isClient) return

    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (token) {
      try {
        // Store the JWT token from backend redirect
        tokenService.setToken(token)
        // Refresh user state to update authentication
        await refreshUser()
        // Clean up URL and let smart routing handle navigation
        router.replace('/')
      } catch (error) {
        console.error('Token processing error:', error)
        router.replace('/?error=token_invalid')
      }
    }
  }, [apiClient, refreshUser, router, isClient])

  useEffect(() => {
    if (isClient) {
      const urlParams = new URLSearchParams(window.location.search)
      // Handle OAuth callback flow (code + state)
      if (urlParams.get('code')) {
        handleAuthCallback()
      }
      // Handle direct token from backend redirect
      else if (urlParams.get('token')) {
        handleTokenFromUrl()
      }
    }
  }, [handleAuthCallback, handleTokenFromUrl, isClient])

  return {
    navigateToHome: () => router.push('/'),
    navigateToLogin: () => router.push('/'),
    handleAuthCallback,
    handleTokenFromUrl,
  }
}
