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
  const [messageStates, setMessageStates] = useState<boolean[]>(
    new Array(loadingMessages.length).fill(false)
  );
  const [analysisStarted, setAnalysisStarted] = useState(false);

  // Start sequential message display
  useEffect(() => {
    const showNextMessage = (index: number) => {
      if (index < loadingMessages.length) {
        setTimeout(() => {
          setMessageStates(prev => {
            const newStates = [...prev];
            newStates[index] = true;
            return newStates;
          });
          showNextMessage(index + 1);
        }, index === 0 ? 500 : 1500); // First message shows after 500ms, others after 1.5s
      }
    };

    showNextMessage(0);
  }, []);

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

      // Wait for analysis to complete
      await analysisPromise;

      // Update the auth context with the new analysis
      await refreshLatestAnalysis();

      // Navigate to results immediately
      onComplete?.();

    } catch (error) {
      console.error('Analysis failed:', error);
      // Still navigate to results on error
      onComplete?.();
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
                unwrapped.fm
              </Typography>

              {/* Loading messages - sequential display */}
              <Box sx={{ minHeight: '300px', width: '100%' }}>
                <Stack spacing={2} alignItems="flex-start">
                  {loadingMessages.map((message, index) => (
                    <Fade
                      key={index}
                      in={messageStates[index]}
                      timeout={800}
                    >
                      <Typography
                        variant="body1"
                        color="text.primary"
                        sx={{
                          lineHeight: 1.6,
                          textAlign: 'left',
                          width: '100%',
                          opacity: messageStates[index] ? 1 : 0
                        }}
                      >
                        {message}
                      </Typography>
                    </Fade>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
