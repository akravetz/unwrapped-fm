'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/domains/authentication/context/AuthContext'
import { tokenService } from '@/lib/tokens/tokenService'
import { useApiClient } from '@/domains/authentication/hooks/useApiClient'
import { authGuard } from '@/shared/utils/authGuard'

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
    if (!apiClient || !isClient) {
      console.log('[useAppNavigation] handleTokenFromUrl: not ready', {
        hasApiClient: !!apiClient,
        isClient
      })
      return
    }

    const currentUrl = window.location.href
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    console.log('[useAppNavigation] handleTokenFromUrl: checking for token', {
      hasToken: !!token,
      url: currentUrl,
      authGuardInfo: authGuard.getDebugInfo()
    })

    if (token) {
      // Check if we can attempt authentication (prevent loops)
      if (!authGuard.canAttemptAuth(currentUrl, 'token')) {
        console.error('[useAppNavigation] handleTokenFromUrl: blocked by auth guard')
        router.replace('/?error=auth_loop_detected')
        return
      }

      // Record this authentication attempt
      authGuard.recordAttempt(currentUrl, 'token')

      try {
        console.log('[useAppNavigation] handleTokenFromUrl: processing token')

        // Store the JWT token from backend redirect
        tokenService.setToken(token)
        console.log('[useAppNavigation] handleTokenFromUrl: token stored')

        // Refresh user state to update authentication
        await refreshUser()
        console.log('[useAppNavigation] handleTokenFromUrl: user refreshed')

        // Clean up URL and let smart routing handle navigation
        router.replace('/')
        console.log('[useAppNavigation] handleTokenFromUrl: navigation completed')

        // Reset auth guard on successful authentication
        authGuard.reset()
      } catch (error) {
        console.error('[useAppNavigation] handleTokenFromUrl: error', error)
        router.replace('/?error=token_invalid')
      }
    }
  }, [apiClient, refreshUser, router, isClient])

  useEffect(() => {
    if (isClient) {
      console.log('[useAppNavigation] Client ready, checking URL parameters')
      const urlParams = new URLSearchParams(window.location.search)
      const hasCode = urlParams.get('code')
      const hasToken = urlParams.get('token')

      console.log('[useAppNavigation] URL parameters:', {
        hasCode: !!hasCode,
        hasToken: !!hasToken,
        url: window.location.href
      })

      // Handle OAuth callback flow (code + state)
      if (hasCode) {
        console.log('[useAppNavigation] Handling OAuth callback')
        handleAuthCallback()
      }
      // Handle direct token from backend redirect
      else if (hasToken) {
        console.log('[useAppNavigation] Handling token from URL')
        handleTokenFromUrl()
      } else {
        console.log('[useAppNavigation] No auth parameters in URL')
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
