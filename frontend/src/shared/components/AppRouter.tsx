'use client'

import React from 'react'
import { useAuth } from '@/domains/authentication/context/AuthContext'
import { useAppNavigation } from '@/shared/hooks/useAppNavigation'
import { LoginScreen } from './LoginScreen'
import { LoadingScreen } from '@/domains/music-analysis/components/LoadingScreen'

interface AppRouterProps {
  children: React.ReactNode
}

export function AppRouter({ children }: AppRouterProps) {
  const { isAuthenticated, isLoading } = useAuth()

  useAppNavigation()

  if (isLoading) {
    return <LoadingScreen message="Loading..." />
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <>{children}</>
}
