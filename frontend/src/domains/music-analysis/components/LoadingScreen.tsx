'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Fade
} from '@mui/material';
import { useAuth } from '@/domains/authentication';
import apiClient from '@/lib/backend/apiClient';

const loadingMessages = [
  "Compiling a list of breakup songs you played ironically...",
  "Checking if that one track was a joke. It wasn't...",
  "I bet you used to make a lot of mix tapes...",
  "Tuning in to your questionable life choices...",
  "Finding a rhyme for 'musical embarrassment'...",
  "Cross-referencing your top artists with community service records...",
  "Interpreting your taste through the lens of someone who's heard good music..."
];

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const { refreshLatestAnalysis } = useAuth();
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);

  // Start analysis when component mounts
  useEffect(() => {
    if (!analysisStarted) {
      setAnalysisStarted(true);
      startAnalysis();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisStarted]);

  const startAnalysis = async () => {
    try {
      // Start the analysis in the background
      const analysisPromise = apiClient.analyzeMusic();

      // Show loading messages while analysis runs
      const messageTimer = setInterval(() => {
        setVisibleMessages(prev => {
          if (prev < loadingMessages.length) {
            return prev + 1;
          } else {
            clearInterval(messageTimer);
            return prev;
          }
        });
      }, 1500); // Show new message every 1.5 seconds

      // Wait for analysis to complete
      await analysisPromise;

      // Update the auth context with the new analysis
      await refreshLatestAnalysis();

      // Clear message timer if still running
      clearInterval(messageTimer);

      // Ensure all messages are shown
      setVisibleMessages(loadingMessages.length);

      // Wait a bit then complete
      setTimeout(() => {
        setIsComplete(true);
        onComplete?.();
      }, 2000);

    } catch (error) {
      console.error('Analysis failed:', error);
      // Still complete the loading screen even if analysis fails
      setTimeout(() => {
        setIsComplete(true);
        onComplete?.();
      }, 2000);
    }
  };

  return (
    <Container maxWidth="md">
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
            maxWidth: 600,
            p: 4,
            textAlign: 'center'
          }}
        >
          <CardContent>
            <Stack spacing={4} alignItems="center">
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
                Unwrapped.fm
              </Typography>

              {/* Loading messages */}
              <Box sx={{ minHeight: '300px', width: '100%' }}>
                <Stack spacing={2} alignItems="flex-start">
                  {loadingMessages.map((message, index) => (
                    <Fade
                      key={index}
                      in={visibleMessages > index}
                      timeout={800}
                      style={{
                        transitionDelay: visibleMessages > index ? '0ms' : '0ms'
                      }}
                    >
                      <Typography
                        variant="body1"
                        color="text.primary"
                        sx={{
                          lineHeight: 1.6,
                          textAlign: 'left',
                          width: '100%'
                        }}
                      >
                        {message}
                      </Typography>
                    </Fade>
                  ))}
                </Stack>
              </Box>

              {/* Results ready indicator */}
              {isComplete && (
                <Fade in={isComplete} timeout={1000}>
                  <Typography
                    variant="h6"
                    color="primary.main"
                    sx={{
                      fontWeight: 600,
                      mt: 3
                    }}
                  >
                    Results are ready →
                  </Typography>
                </Fade>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
