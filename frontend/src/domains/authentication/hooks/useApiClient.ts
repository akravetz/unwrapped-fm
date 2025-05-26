'use client'

import { useState, useEffect, useMemo } from 'react'
import { AuthenticatedApiClient } from '@/lib/api/apiClient'

export function useApiClient(): AuthenticatedApiClient | null {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const apiClient = useMemo(() => {
    if (!isClient) return null
    return new AuthenticatedApiClient()
  }, [isClient])

  return apiClient
}
