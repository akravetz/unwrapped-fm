'use client'

import React, { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Typography,
  Stack,
  Chip
} from '@mui/material'
import { useAuth } from '@/domains/authentication/context/AuthContext'
import { tokenService } from '@/lib/tokens/tokenService'
import { getBrowserInfo } from '@/shared/utils/browser'

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, isLoading, error, user } = useAuth()

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const browserInfo = getBrowserInfo()
  const storageInfo = tokenService.getStorageInfo()

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <Button
        variant="contained"
        size="small"
        onClick={() => setIsOpen(!isOpen)}
        sx={{ mb: 1 }}
      >
        Debug {isOpen ? '▼' : '▲'}
      </Button>

      <Collapse in={isOpen}>
        <Card sx={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Debug Info</Typography>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Authentication State
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    label={`Auth: ${isAuthenticated ? 'Yes' : 'No'}`}
                    color={isAuthenticated ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip
                    label={`Loading: ${isLoading ? 'Yes' : 'No'}`}
                    color={isLoading ? 'warning' : 'default'}
                    size="small"
                  />
                  {error && (
                    <Chip
                      label="Error"
                      color="error"
                      size="small"
                    />
                  )}
                </Stack>
                {user && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    User ID: {user.id}
                  </Typography>
                )}
                {error && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Error: {error}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Storage Info
                </Typography>
                <Typography variant="body2">
                  Adapter: {storageInfo.storageAdapter}
                </Typography>
                <Typography variant="body2">
                  Available: {storageInfo.storageAvailable ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                  Has Token: {storageInfo.hasToken ? 'Yes' : 'No'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Browser Info
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {browserInfo.isMobile && (
                    <Chip label="Mobile" color="primary" size="small" />
                  )}
                  {browserInfo.isIOS && (
                    <Chip label="iOS" color="info" size="small" />
                  )}
                  {browserInfo.isAndroid && (
                    <Chip label="Android" color="info" size="small" />
                  )}
                  {browserInfo.isSafari && (
                    <Chip label="Safari" size="small" />
                  )}
                  {browserInfo.isChrome && (
                    <Chip label="Chrome" size="small" />
                  )}
                  {browserInfo.isFirefox && (
                    <Chip label="Firefox" size="small" />
                  )}
                  {browserInfo.isPrivateMode === true && (
                    <Chip label="Private Mode" color="warning" size="small" />
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  URL Info
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {typeof window !== 'undefined' ? window.location.href : 'SSR'}
                </Typography>
              </Box>

              <Button
                size="small"
                onClick={() => {
                  console.log('=== DEBUG INFO ===')
                  console.log('Auth State:', { isAuthenticated, isLoading, error, user })
                  console.log('Storage Info:', storageInfo)
                  console.log('Browser Info:', browserInfo)
                  console.log('URL:', typeof window !== 'undefined' ? window.location.href : 'SSR')
                  console.log('==================')
                }}
              >
                Log to Console
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  )
}
