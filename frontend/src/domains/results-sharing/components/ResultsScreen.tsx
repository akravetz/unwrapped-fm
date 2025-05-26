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
  Divider
} from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { MusicAnalysisResponse } from '@/domains/music-analysis/types/music.types'

interface ResultsScreenProps {
  result: MusicAnalysisResponse
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
                    <Typography variant="body2" color="text.secondary">
                      Analysis from {new Date(result.analyzed_at).toLocaleDateString()}
                    </Typography>
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
                    Music Taste Analysis
                  </Typography>
                  <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" gutterBottom>
                        {result.rating_text}
                      </Typography>
                      <Typography variant="body1">
                        {result.rating_description}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Position: ({result.x_axis_pos.toFixed(2)}, {result.y_axis_pos.toFixed(2)})
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
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
