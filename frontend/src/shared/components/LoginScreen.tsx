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
import { COPY } from '@/lib/constants/copy'

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
                {COPY.APP_NAME}
              </Typography>

              <Typography variant="body1" color="text.secondary">
                {COPY.AUTH.TAGLINE}
              </Typography>

              <Box sx={{ width: '100%', mt: 3 }}>
                <LoginButton fullWidth size="large" />
              </Box>

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
