'use client'

import { useState, useEffect, useMemo } from 'react'
import { AuthenticatedApiClient } from '@/lib/api/apiClient'

export function useApiClient(): AuthenticatedApiClient | null {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    console.log('[useApiClient] Setting isClient to true')
    setIsClient(true)
  }, [])

  const apiClient = useMemo(() => {
    if (!isClient) {
      console.log('[useApiClient] Not client-side yet, returning null')
      return null
    }
    console.log('[useApiClient] Creating AuthenticatedApiClient')
    return new AuthenticatedApiClient()
  }, [isClient])

  console.log('[useApiClient] Returning apiClient:', !!apiClient)
  return apiClient
}
