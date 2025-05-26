'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useState, ReactNode } from 'react'
import { useApiClient } from '../hooks/useApiClient'
import { tokenService } from '@/lib/tokens/tokenService'
import type { AuthState, AuthContextType, User } from '../types/auth.types'

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        error: null
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const [hasInitialized, setHasInitialized] = useState(false)
  const apiClient = useApiClient()

  const refreshUser = useCallback(async () => {
    if (!apiClient) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const token = tokenService.getToken()

      if (!token || tokenService.isTokenExpired(token)) {
        tokenService.removeToken()
        dispatch({ type: 'SET_USER', payload: null })
        return
      }

      const user = await apiClient.getCurrentUser()
      dispatch({ type: 'SET_USER', payload: user })
    } catch (error) {
      console.error('Failed to refresh user:', error)
      tokenService.removeToken()
      dispatch({ type: 'SET_USER', payload: null })
      dispatch({ type: 'SET_ERROR', payload: 'Failed to authenticate' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [apiClient])

  const login = useCallback(async () => {
    if (!apiClient) return

    try {
      const { authorization_url } = await apiClient.getSpotifyAuthUrl()
      window.location.href = authorization_url
    } catch (error) {
      console.error('Failed to initiate login:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initiate login' })
    }
  }, [apiClient])

  const logout = useCallback(() => {
    tokenService.removeToken()
    dispatch({ type: 'SET_USER', payload: null })

    if (apiClient) {
      apiClient.logout().catch(console.error)
    }
  }, [apiClient])

  useEffect(() => {
    if (apiClient && !hasInitialized) {
      setHasInitialized(true)
      refreshUser()
    }
  }, [apiClient, hasInitialized, refreshUser])

  const value: AuthContextType = useMemo(() => ({
    ...state,
    login,
    logout,
    refreshUser,
  }), [state, login, logout, refreshUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
