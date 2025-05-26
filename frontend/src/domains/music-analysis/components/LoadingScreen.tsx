'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  CircularProgress,
  Fade
} from '@mui/material'
import { COPY } from '@/lib/constants/copy'

interface LoadingScreenProps {
  message?: string
  progress?: number
  details?: string[]
}

export function LoadingScreen({
  message,
  progress,
  details = []
}: LoadingScreenProps) {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([])

  // Cycle through loading messages every second
  useEffect(() => {
    let messageIndex = 0

    // Add the first message immediately
    setVisibleMessages([COPY.LOADING.MESSAGES[0]])

    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % COPY.LOADING.MESSAGES.length

      // Add the new message to visible messages
      setVisibleMessages((prevMessages) => [
        ...prevMessages,
        COPY.LOADING.MESSAGES[messageIndex]
      ])
    }, COPY.LOADING.MESSAGE_DURATION)

    return () => clearInterval(interval)
  }, [])

  // Use custom messages if provided, otherwise use the cycling messages
  const displayMessages = details.length > 0 ? details : visibleMessages

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
        <Card elevation={0} sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={4} alignItems="center" textAlign="center">
              <CircularProgress size={60} thickness={4} />

              <Typography variant="h5" component="h1">
                {message || COPY.APP_NAME}
              </Typography>

              {progress !== undefined && (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {Math.round(progress)}% complete
                  </Typography>
                </Box>
              )}

              {displayMessages.length > 0 && (
                <Stack spacing={1} alignItems="center" sx={{ minHeight: '200px' }}>
                  {displayMessages.map((messageText, index) => (
                    <Fade in={true} timeout={500} key={index}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontStyle: 'italic',
                          opacity: index === displayMessages.length - 1 ? 1 : 0.7
                        }}
                      >
                        {messageText}
                      </Typography>
                    </Fade>
                  ))}
                </Stack>
              )}

              {displayMessages.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  {COPY.LOADING.PROGRESS_DESCRIPTION}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
