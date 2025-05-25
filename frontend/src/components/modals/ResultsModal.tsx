
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Divider,
  Chip,
  Fade,
  Zoom,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close,
  MusicNote,
  ContentCopy,
} from '@mui/icons-material';
import { QuadrantGraph } from '../ui/QuadrantGraph';
import { useAnalysis } from '../../contexts/AnalysisContext';
import { useState } from 'react';

interface ResultsModalProps {
  open: boolean;
}

export function ResultsModal({ open }: ResultsModalProps) {
  const { analysisResult, resetAnalysis } = useAnalysis();
  const [copySuccess, setCopySuccess] = useState(false);

  if (!analysisResult) return null;

  // Generate the share URL using the actual share token
  const shareUrl = `${window.location.origin}/share/${analysisResult.share_token}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleCloseCopySuccess = () => {
    setCopySuccess(false);
  };

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 0,
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        },
      }}
    >
      <DialogContent sx={{ padding: 0 }}>
        <Fade in={open} timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 3,
              borderBottom: 1,
              borderColor: 'divider',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MusicNote sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  unwrapped.fm
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={resetAnalysis} size="small">
                  <Close />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
            }}>
              {/* Left Column - Rating */}
              <Box sx={{ flex: 1 }}>
                <Zoom in={open} timeout={1000}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                      {/* PitchFork Style Rating */}
                      <Typography
                        variant="overline"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          letterSpacing: 2,
                          mb: 2,
                          display: 'block',
                        }}
                      >
                        PitchFork music rating:
                      </Typography>

                      <Typography
                        variant="h2"
                        component="h1"
                        sx={{
                          fontSize: { xs: '2rem', sm: '2.5rem' },
                          fontWeight: 700,
                          color: 'primary.main',
                          mb: 3,
                          letterSpacing: 1,
                        }}
                      >
                        {analysisResult.rating_text}
                      </Typography>

                      <Divider sx={{ my: 3 }} />

                      {/* Description */}
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.primary',
                          lineHeight: 1.6,
                          fontSize: '1rem',
                          textAlign: 'left',
                        }}
                      >
                        {analysisResult.rating_description}
                      </Typography>

                      {/* Sample tags/genres */}
                      <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        <Chip label="Indie Rock" size="small" variant="outlined" />
                        <Chip label="Alternative" size="small" variant="outlined" />
                        <Chip label="Questionable" size="small" variant="outlined" color="secondary" />
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Box>

              {/* Right Column - Graph */}
              <Box sx={{ flex: 1 }}>
                <Zoom in={open} timeout={1200}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 3,
                          fontWeight: 600,
                          color: 'text.primary',
                        }}
                      >
                        Your Musical Position
                      </Typography>

                      <QuadrantGraph
                        x={analysisResult.x_axis_pos}
                        y={analysisResult.y_axis_pos}
                        size={280}
                      />

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 2,
                          color: 'text.secondary',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                        }}
                      >
                        Based on your listening patterns, musical diversity, and taste preferences
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Box>
            </Box>

            {/* Footer - Share URL */}
            <Box sx={{
              p: 3,
              borderTop: 1,
              borderColor: 'divider',
            }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                Share your music taste analysis:
              </Typography>

              <TextField
                fullWidth
                value={shareUrl}
                variant="outlined"
                size="small"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleCopyUrl}
                        edge="end"
                        size="small"
                        sx={{ color: 'primary.main' }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              />
            </Box>

            {/* Copy Success Snackbar */}
            <Snackbar
              open={copySuccess}
              autoHideDuration={3000}
              onClose={handleCloseCopySuccess}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert
                onClose={handleCloseCopySuccess}
                severity="success"
                sx={{ width: '100%' }}
              >
                Share URL copied to clipboard!
              </Alert>
            </Snackbar>
          </Box>
        </Fade>
      </DialogContent>
    </Dialog>
  );
}
