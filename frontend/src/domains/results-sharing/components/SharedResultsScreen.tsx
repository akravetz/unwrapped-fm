'use client'

import React from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip
} from '@mui/material'
import { PublicAnalysisResponse } from '@/domains/music-analysis/types/music.types'
import { MusicScoreBar } from './MusicScoreBar'
import { COPY } from '@/lib/constants/copy'

interface SharedResultsScreenProps {
  result: PublicAnalysisResponse
}

export function SharedResultsScreen({ result }: SharedResultsScreenProps) {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box textAlign="center">
            <Typography variant="h3" component="h1" color="primary" gutterBottom>
              {COPY.APP_NAME}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Music Analysis Results
            </Typography>
            <Chip
              label="Shared Analysis"
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>

          <Card elevation={0}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Analysis from {new Date(result.analyzed_at).toLocaleDateString()}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Music Taste Analysis
                  </Typography>
                  <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" gutterBottom>
                        {result.rating_text}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3 }}>
                        {result.rating_description}
                      </Typography>

                      <Stack spacing={3}>
                        <MusicScoreBar
                          score={result.critical_acclaim_score}
                          leftLabel={COPY.RESULTS.CHART_AXES.HORIZONTAL.LEFT}
                          rightLabel={COPY.RESULTS.CHART_AXES.HORIZONTAL.RIGHT}
                          color="primary"
                        />
                        <MusicScoreBar
                          score={result.music_snob_score}
                          leftLabel={COPY.RESULTS.CHART_AXES.VERTICAL.TOP}
                          rightLabel={COPY.RESULTS.CHART_AXES.VERTICAL.BOTTOM}
                          color="primary"
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                <Divider />

                {/* Footer */}
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Want to analyze your own music taste?
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    Visit {COPY.APP_NAME} to get started
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  )
}
