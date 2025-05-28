'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/domains/authentication/context/AuthContext'
import { useAppNavigation } from '@/shared/hooks/useAppNavigation'
import { LoginScreen } from './LoginScreen'
import { LoadingScreen } from '@/domains/music-analysis/components/LoadingScreen'
import { MobileAuthError } from './MobileAuthError'
import { getBrowserInfo } from '@/shared/utils/browser'

interface AppRouterProps {
  children: React.ReactNode
}

export function AppRouter({ children }: AppRouterProps) {
  const { isAuthenticated, isLoading, error } = useAuth()
  const [urlError, setUrlError] = useState<string | null>(null)

  useAppNavigation()

  // Check for URL error parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const errorParam = urlParams.get('error')
      if (errorParam) {
        setUrlError(errorParam)
      }
    }
  }, [])

  console.log('[AppRouter] Render state:', {
    isAuthenticated,
    isLoading,
    hasError: !!error,
    urlError,
    url: typeof window !== 'undefined' ? window.location.href : 'SSR'
  })

  const browserInfo = getBrowserInfo()
  const hasAuthError = error || urlError
  const shouldShowMobileError = hasAuthError && browserInfo.isMobile

  const handleRetry = () => {
    setUrlError(null)
    // Clear URL parameters
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname)
    }
    // Reload the page to restart authentication
    window.location.reload()
  }

  if (isLoading) {
    return <LoadingScreen message="Loading..." />
  }

  // Show mobile-specific error screen for mobile users
  if (shouldShowMobileError) {
    return (
      <MobileAuthError
        error={urlError || error || 'unknown'}
        onRetry={handleRetry}
      />
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <>{children}</>
}
