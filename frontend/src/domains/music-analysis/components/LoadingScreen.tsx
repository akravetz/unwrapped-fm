'use client'

import React from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  CircularProgress
} from '@mui/material'

interface LoadingScreenProps {
  message?: string
  progress?: number
  details?: string[]
}

export function LoadingScreen({
  message = 'Analyzing your music...',
  progress,
  details = []
}: LoadingScreenProps) {
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
                {message}
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

              {details.length > 0 && (
                <Stack spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Current steps:
                  </Typography>
                  {details.map((detail, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: 'italic' }}
                    >
                      • {detail}
                    </Typography>
                  ))}
                </Stack>
              )}

              <Typography variant="body2" color="text.secondary">
                This may take a few minutes while we analyze your listening history
                and generate insights.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
