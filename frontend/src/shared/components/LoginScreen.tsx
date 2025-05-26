'use client'

import React from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack
} from '@mui/material'
import { LoginButton } from '@/domains/authentication/components/LoginButton'

export function LoginScreen() {
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
                Unwrapped.fm
              </Typography>

              <Typography variant="body1" color="text.secondary">
                Discover your music listening patterns and get AI-powered insights
                into your Spotify data.
              </Typography>

              <Box sx={{ width: '100%', mt: 3 }}>
                <LoginButton fullWidth size="large" />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                We&apos;ll redirect you to Spotify to securely connect your account.
                No passwords required.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
