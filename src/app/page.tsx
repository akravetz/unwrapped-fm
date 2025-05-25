'use client';

import React from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Chip,
  Grid
} from '@mui/material';
import { LoginButton } from '@/domains/authentication/components/LoginButton';
import { useAuth } from '@/domains/authentication/context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();

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

  if (isAuthenticated && user) {
    return (
      <Container maxWidth="md">
        <Box py={8}>
          <Stack spacing={4} alignItems="center">
            <Typography variant="h3" component="h1" textAlign="center">
              Welcome back, {user.display_name || 'Music Lover'}! 🎵
            </Typography>

            <Typography variant="h6" color="text.secondary" textAlign="center">
              Ready to get your music taste judged by AI?
            </Typography>

            <Card sx={{ maxWidth: 400, width: '100%' }}>
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <Typography variant="h6">
                    Your Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Spotify ID: {user.spotify_id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since: {new Date(user.created_at).toLocaleDateString()}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={8}>
        <Stack spacing={6} alignItems="center">
          {/* Hero Section */}
          <Box textAlign="center">
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                background: 'linear-gradient(45deg, #1DB954 30%, #1ED760 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              unwrapped.fm
            </Typography>

            <Typography
              variant="h4"
              component="h2"
              color="text.primary"
              gutterBottom
              sx={{ mb: 3 }}
            >
              Your Friends Think Your Taste in Music is Trash
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
            >
              Connect to your Spotify and we'll be the judge of that.
            </Typography>

            <LoginButton size="large" />
          </Box>

          {/* Features */}
          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Typography variant="h2">🎵</Typography>
                    <Typography variant="h6">
                      AI Music Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Our AI analyzes your listening history and provides brutally honest feedback about your music taste.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Typography variant="h2">📊</Typography>
                    <Typography variant="h6">
                      Detailed Insights
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get comprehensive breakdowns of your genres, artists, and listening patterns with witty commentary.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Typography variant="h2">🔗</Typography>
                    <Typography variant="h6">
                      Share Results
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Share your music personality with friends and see how your taste stacks up against others.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Privacy Notice */}
          <Box textAlign="center" sx={{ mt: 6 }}>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              <Chip label="🔒 Privacy First" variant="outlined" />
              <Chip label="🚫 No Data Storage" variant="outlined" />
              <Chip label="⚡ Instant Results" variant="outlined" />
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, maxWidth: 500, mx: 'auto' }}
            >
              We don't store your listening data. We use it to judge you and then throw it away.
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}
