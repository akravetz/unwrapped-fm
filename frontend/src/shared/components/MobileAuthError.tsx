'use client'

import React from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { getBrowserInfo } from '@/shared/utils/browser'
import { authGuard } from '@/shared/utils/authGuard'
import { tokenService } from '@/lib/tokens/tokenService'

interface MobileAuthErrorProps {
  error: string
  onRetry: () => void
}

export function MobileAuthError({ error, onRetry }: MobileAuthErrorProps) {
  const browserInfo = getBrowserInfo()
  const storageInfo = tokenService.getStorageInfo()
  const authGuardInfo = authGuard.getDebugInfo()

  const handleClearData = () => {
    tokenService.removeToken()
    authGuard.reset()
    // Clear any other stored data
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (e) {
        console.warn('Failed to clear storage:', e)
      }
    }
    onRetry()
  }

  const getMobileSpecificGuidance = () => {
    if (browserInfo.isPrivateMode) {
      return {
        title: 'Private/Incognito Mode Detected',
        message: 'Private browsing mode can prevent authentication from working properly.',
        solutions: [
          'Try opening the app in a regular (non-private) browser window',
          'Disable private browsing mode',
          'Use a different browser app'
        ]
      }
    }

    if (browserInfo.isSafari && browserInfo.isIOS) {
      return {
        title: 'iOS Safari Authentication Issue',
        message: 'iOS Safari has strict privacy settings that can interfere with authentication.',
        solutions: [
          'Go to Settings > Safari > Privacy & Security',
          'Disable "Prevent Cross-Site Tracking" temporarily',
          'Enable "Allow All Cookies" temporarily',
          'Try using Chrome or Firefox instead'
        ]
      }
    }

    if (!storageInfo.storageAvailable) {
      return {
        title: 'Storage Not Available',
        message: 'Your browser is blocking data storage, which is required for authentication.',
        solutions: [
          'Check your browser privacy settings',
          'Allow cookies and local storage for this site',
          'Try a different browser',
          'Restart your browser and try again'
        ]
      }
    }

    return {
      title: 'Mobile Authentication Issue',
      message: 'There was a problem with authentication on your mobile device.',
      solutions: [
        'Try refreshing the page',
        'Clear your browser cache and cookies',
        'Try a different browser app',
        'Restart your browser and try again'
      ]
    }
  }

  const guidance = getMobileSpecificGuidance()

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
              <Typography variant="h4" component="h1" color="error">
                Authentication Error
              </Typography>

              <Alert severity="error" sx={{ width: '100%' }}>
                {error === 'auth_loop_detected'
                  ? 'Authentication loop detected. Please try again.'
                  : error === 'token_invalid'
                  ? 'Invalid authentication token received.'
                  : 'Authentication failed. Please try again.'
                }
              </Alert>

              {browserInfo.isMobile && (
                <Alert severity="info" sx={{ width: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {guidance.title}
                  </Typography>
                  <Typography variant="body2">
                    {guidance.message}
                  </Typography>
                </Alert>
              )}

              <Stack spacing={2} sx={{ width: '100%' }}>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={onRetry}
                >
                  Try Again
                </Button>

                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  onClick={handleClearData}
                >
                  Clear Data & Retry
                </Button>
              </Stack>

              {browserInfo.isMobile && (
                <Accordion sx={{ width: '100%' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Troubleshooting Steps
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      {guidance.solutions.map((solution, index) => (
                        <Typography key={index} variant="body2" sx={{ textAlign: 'left' }}>
                          {index + 1}. {solution}
                        </Typography>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}

              {process.env.NODE_ENV === 'development' && (
                <Accordion sx={{ width: '100%' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Debug Information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1} sx={{ textAlign: 'left' }}>
                      <Typography variant="body2">
                        <strong>Browser:</strong> {browserInfo.userAgent}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Mobile:</strong> {browserInfo.isMobile ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Private Mode:</strong> {browserInfo.isPrivateMode ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Storage:</strong> {storageInfo.storageAdapter}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Auth Attempts:</strong> {typeof authGuardInfo === 'object' && authGuardInfo && 'attempts' in authGuardInfo ? String(authGuardInfo.attempts) : 'Unknown'}
                      </Typography>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
