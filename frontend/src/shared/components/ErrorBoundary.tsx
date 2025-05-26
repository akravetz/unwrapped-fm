'use client'

import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack
} from '@mui/material'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
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
                Something went wrong
              </Typography>

              <Typography variant="body1" color="text.secondary">
                We encountered an unexpected error. Please try refreshing the page.
              </Typography>

              {error && (
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {error.message}
                </Typography>
              )}

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={resetError}>
                  Try Again
                </Button>
                <Button variant="contained" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
