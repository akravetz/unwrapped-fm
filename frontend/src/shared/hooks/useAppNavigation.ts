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
        router.replace('/dashboard')
      } catch (error) {
        console.error('Auth callback error:', error)
        router.replace('/?error=auth_failed')
      }
    }
  }, [apiClient, refreshUser, router, isClient])

  useEffect(() => {
    if (isClient) {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('code')) {
        handleAuthCallback()
      }
    }
  }, [handleAuthCallback, isClient])

  return {
    navigateToDashboard: () => router.push('/dashboard'),
    navigateToLogin: () => router.push('/'),
    handleAuthCallback,
  }
}
