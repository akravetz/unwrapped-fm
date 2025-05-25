
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
  Fade,
  Slide,
} from '@mui/material';
import { MusicNote } from '@mui/icons-material';
import { useAnalysis } from '../../contexts/AnalysisContext';

interface LoadingModalProps {
  open: boolean;
}

export function LoadingModal({ open }: LoadingModalProps) {
  const { loadingMessages, currentMessageIndex, progress } = useAnalysis();

  const currentMessage = loadingMessages[currentMessageIndex] || 'Analyzing your music taste...';

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
        },
      }}
    >
      <DialogContent sx={{ padding: 0, width: '100%' }}>
        <Fade in={open} timeout={800}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Header */}
            <Box sx={{ mb: 6 }}>
              <MusicNote
                sx={{
                  fontSize: 64,
                  color: 'white',
                  mb: 2,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                    '50%': {
                      transform: 'scale(1.1)',
                      opacity: 0.8,
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                  },
                }}
              />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontSize: { xs: '1.8rem', sm: '2.2rem' },
                  fontWeight: 600,
                  color: 'white',
                  mb: 1,
                }}
              >
                unwrapped.fm
              </Typography>
            </Box>

            {/* Loading Spinner */}
            <Box sx={{ mb: 4 }}>
              <CircularProgress
                size={80}
                thickness={3}
                sx={{
                  color: 'white',
                  mb: 3,
                }}
              />
            </Box>

            {/* Rotating Messages */}
            <Box sx={{ mb: 4, minHeight: '120px', display: 'flex', alignItems: 'center' }}>
              <Slide
                direction="up"
                in={true}
                key={currentMessageIndex}
                timeout={500}
              >
                <Typography
                  variant="h5"
                  component="p"
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                    fontWeight: 400,
                    color: 'white',
                    lineHeight: 1.4,
                    maxWidth: '600px',
                    fontStyle: 'italic',
                  }}
                >
                  {currentMessage}
                </Typography>
              </Slide>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ width: '100%', maxWidth: '400px', mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(45deg, #1DB954 30%, #1ed760 90%)',
                  },
                }}
              />
            </Box>

            {/* Progress Text */}
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem',
              }}
            >
              {Math.round(progress)}% complete
            </Typography>

            {/* Fade in messages that appear line by line */}
            <Box sx={{ mt: 4, opacity: 0.7 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontSize: '0.8rem',
                  animation: 'fadeIn 2s ease-in-out',
                  '@keyframes fadeIn': {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 0.7 },
                  },
                }}
              >
                These fade in line by line until results are ready
              </Typography>
            </Box>
          </Box>
        </Fade>
      </DialogContent>
    </Dialog>
  );
}
