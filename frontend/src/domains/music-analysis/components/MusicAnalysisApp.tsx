'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Button
} from '@mui/material'
import { useApiClient } from '@/domains/authentication/hooks/useApiClient'
import { LoadingScreen } from './LoadingScreen'
import { ResultsScreen } from '@/domains/results-sharing/components/ResultsScreen'
import { COPY } from '@/lib/constants/copy'
import type { MusicAnalysisResponse } from '../types/music.types'

export function MusicAnalysisApp() {
  const [analysisState, setAnalysisState] = useState<'idle' | 'loading' | 'completed' | 'error'>('idle')
  const [analysisResult, setAnalysisResult] = useState<MusicAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const apiClient = useApiClient()

  const checkExistingAnalysis = useCallback(async () => {
    if (!apiClient) return

    try {
      // Check if user has a completed analysis
      const result = await apiClient.getAnalysisResult()
      setAnalysisResult(result)
      setAnalysisState('completed')
    } catch {
      // No existing analysis or error - stay in idle state
      console.log('No existing analysis found')
    }
  }, [apiClient])

  // Check for existing analysis on mount
  useEffect(() => {
    checkExistingAnalysis()
  }, [checkExistingAnalysis])

  const startAnalysis = async () => {
    if (!apiClient) return

    try {
      setAnalysisState('loading')
      setError(null)

      // Begin analysis
      await apiClient.beginAnalysis()

      // Poll for completion
      await pollAnalysisStatus()
    } catch (err) {
      console.error('Analysis failed:', err)
      setError('Failed to start analysis. Please try again.')
      setAnalysisState('error')
    }
  }

  const pollAnalysisStatus = async () => {
    if (!apiClient) return

    const pollInterval = setInterval(async () => {
      try {
        const status = await apiClient.pollAnalysisStatus()

        if (status.status === 'completed') {
          clearInterval(pollInterval)
          // Get the final result
          const result = await apiClient.getAnalysisResult()
          setAnalysisResult(result)
          setAnalysisState('completed')
        } else if (status.status === 'failed') {
          clearInterval(pollInterval)
          setError(status.error_message || 'Analysis failed')
          setAnalysisState('error')
        }
        // Continue polling if status is 'pending' or 'processing'
      } catch (err) {
        clearInterval(pollInterval)
        console.error('Polling failed:', err)
        setError('Failed to check analysis status')
        setAnalysisState('error')
      }
    }, 2000) // Poll every 2 seconds

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval)
  }

  const resetAnalysis = () => {
    setAnalysisState('idle')
    setAnalysisResult(null)
    setError(null)
  }

  // Loading state
  if (analysisState === 'loading') {
    return <LoadingScreen message="Analyzing your music taste..." />
  }

  // Results state
  if (analysisState === 'completed' && analysisResult) {
    return (
      <ResultsScreen
        result={analysisResult}
        onShare={(shareUrl) => {
          // Handle sharing logic
          navigator.clipboard.writeText(shareUrl)
        }}
      />
    )
  }

  // Idle or error state - show analysis start screen
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card elevation={0} sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <Typography variant="h3" component="h1" color="primary">
                {COPY.APP_NAME}
              </Typography>

              <Typography variant="body1" color="text.secondary">
                {COPY.AUTH.TAGLINE}
              </Typography>

              {error && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}

              <Box sx={{ width: '100%', mt: 3 }}>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={startAnalysis}
                  disabled={!apiClient}
                >
                  {COPY.AUTH.LOGIN_BUTTON}
                </Button>
              </Box>

              {analysisState === 'error' && (
                <Button
                  variant="outlined"
                  onClick={resetAnalysis}
                  sx={{ mt: 2 }}
                >
                  Try Again
                </Button>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {COPY.AUTH.OAUTH_DISCLAIMER}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
