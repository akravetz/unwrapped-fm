'use client';

import React, { useState } from 'react';
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
  const { isAuthenticated, user, isLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>('login');

  // Demo data for results screen
  const demoRating = {
    category: 'HIPSTER TRASH',
    score: 25,
    description: 'Lil Wayne and Alan Jackson? What are you, some sort of redneck rapper wanna be? Embarrassing.'
  };

  const demoUser = {
    display_name: user?.display_name || 'Music Lover',
    profile_image_url: user?.profile_image_url || null
  };

  if (isLoading) {
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

  // If authenticated, show the flow based on app state
  if (isAuthenticated && user) {
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
            user={demoUser}
            rating={demoRating}
            onStartOver={() => setAppState('login')}
          />
        );
      default:
        // Show authenticated welcome screen with option to start analysis
        return (
          <Container maxWidth="md">
            <Box py={8}>
              <Stack spacing={4} alignItems="center">
                <Typography variant="h3" component="h1" textAlign="center">
                  Welcome back, {user.display_name || 'Music Lover'}! 🎵
                </Typography>

                <Typography variant="h6" color="text.secondary" textAlign="center">
                  Ready to analyze your music taste?
                </Typography>

                <Card sx={{ maxWidth: 400, width: '100%' }}>
                  <CardContent>
                    <Stack spacing={3} alignItems="center">
                      <Typography variant="h6">
                        Your Profile
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Spotify ID: {user.spotify_id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Member since: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </Typography>

                      {/* Demo button to start analysis */}
                      <LoginButton
                        size="large"
                        fullWidth
                        onClick={() => setAppState('loading')}
                      >
                        Analyze My Taste
                      </LoginButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </Container>
        );
    }
  }

  // Default login screen (matches wireframe)
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
