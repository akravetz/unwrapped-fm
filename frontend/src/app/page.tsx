'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import { LoginButton, useAuth } from '@/domains/authentication';
import { LoadingScreen } from '@/domains/music-analysis';
import { ResultsScreen } from '@/domains/results-sharing';
import { ClientWrapper } from './ClientWrapper';

type AppState = 'login' | 'loading' | 'results';

function HomePageContent() {
  const { isAuthenticated, user, isLoading, latestAnalysis, analysisLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>('login');

  // Auto-route based on authentication and analysis state
  useEffect(() => {
    if (isAuthenticated && user && !analysisLoading) {
      if (latestAnalysis) {
        // User has existing results - go directly to results
        setAppState('results');
      } else {
        // User has no existing results - start analysis
        setAppState('loading');
      }
    } else if (!isAuthenticated && !isLoading) {
      // User not authenticated - show login
      setAppState('login');
    }
  }, [isAuthenticated, user, latestAnalysis, analysisLoading, isLoading]);

  if (isLoading || analysisLoading) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Typography variant="h6" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Show screens based on app state
  switch (appState) {
    case 'loading':
      return (
        <LoadingScreen
          onComplete={() => setAppState('results')}
        />
      );
    case 'results':
      return (
        <ResultsScreen
          analysis={latestAnalysis}
          onAnalyzeAgain={() => setAppState('loading')}
          onStartOver={() => setAppState('login')}
        />
      );
    default:
      // Show login screen (no welcome screen)
      return (
        <Container maxWidth="sm">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            py={4}
          >
            <Card
              sx={{
                width: '100%',
                maxWidth: 400,
                p: 3,
                textAlign: 'center'
              }}
            >
              <CardContent>
                <Stack spacing={3} alignItems="center">
                  {/* Title */}
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      background: 'linear-gradient(45deg, #1DB954 30%, #1ED760 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                    }}
                  >
                    unwrapped.fm
                  </Typography>

                  {/* Main message */}
                  <Typography
                    variant="body1"
                    color="text.primary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    Your friends think your taste in music is trash. Connect to your Spotify and we&apos;ll be the judge of that.
                  </Typography>

                  {/* Login Button */}
                  <LoginButton size="large" fullWidth />

                  {/* Privacy notice */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      mt: 2
                    }}
                  >
                    We do not store any of your listening data. We use it to analyze you and then throw it away.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Container>
      );
  }
}

export default function HomePage() {
  return (
    <ClientWrapper
      fallback={
        <Container maxWidth="sm">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
          >
            <Typography variant="h6" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        </Container>
      }
    >
      <HomePageContent />
    </ClientWrapper>
  );
}
