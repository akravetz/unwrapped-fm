'use client';

import React from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import { LoginButton } from '@/domains/authentication';

export function LoginScreen() {
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
