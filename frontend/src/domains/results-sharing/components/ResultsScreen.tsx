'use client'

import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  Chip
} from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { AnalysisResult } from '@/domains/music-analysis/types/music.types'

interface ResultsScreenProps {
  result: AnalysisResult
  onShare?: (shareUrl: string) => void
}

export function ResultsScreen({ result, onShare }: ResultsScreenProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  const handleShare = async () => {
    if (result.share_token) {
      const url = `${window.location.origin}/shared/${result.share_token}`
      setShareUrl(url)
      onShare?.(url)
    }
  }

  const handleCopyUrl = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setShowCopySuccess(true)
    }
  }

  const formatTimeRange = (timeRange: string) => {
    switch (timeRange) {
      case 'short_term': return 'Last 4 weeks'
      case 'medium_term': return 'Last 6 months'
      case 'long_term': return 'All time'
      default: return timeRange
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Card elevation={0}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                      Your Music Analysis
                    </Typography>
                    <Chip
                      label={formatTimeRange(result.time_range)}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  {result.share_token && (
                    <Button
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={handleShare}
                    >
                      Share Results
                    </Button>
                  )}
                </Stack>

                {shareUrl && (
                  <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" sx={{ flex: 1, fontFamily: 'monospace' }}>
                          {shareUrl}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={handleCopyUrl}
                          title="Copy link"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom>
                    AI Insights
                  </Typography>
                  <Stack spacing={2}>
                    {result.insights?.map((insight, index) => (
                      <Card key={index} variant="outlined" sx={{ bgcolor: 'background.default' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="body1">
                            {insight}
                          </Typography>
                        </CardContent>
                      </Card>
                    )) || (
                      <Typography variant="body2" color="text.secondary">
                        No insights available for this analysis.
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {result.analysis_data && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Analysis Data
                    </Typography>
                    <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography
                          variant="body2"
                          component="pre"
                          sx={{
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            overflow: 'auto',
                            maxHeight: 400
                          }}
                        >
                          {JSON.stringify(result.analysis_data, null, 2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                )}

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Analysis completed on {new Date(result.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Snackbar
        open={showCopySuccess}
        autoHideDuration={3000}
        onClose={() => setShowCopySuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowCopySuccess(false)}>
          Share link copied to clipboard!
        </Alert>
      </Snackbar>
    </Container>
  )
}
