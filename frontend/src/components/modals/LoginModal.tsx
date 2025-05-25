import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  Alert,
  Fade,
} from '@mui/material';
import { MusicNote, Headphones } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  open: boolean;
}

export function LoginModal({ open }: LoginModalProps) {
  const { login, isLoading, error, clearError } = useAuth();

  const handleJudgeMe = async () => {
    try {
      // Start the Spotify OAuth flow
      await login();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        },
      }}
    >
      <DialogContent sx={{ padding: 0 }}>
        <Fade in={open} timeout={600}>
          <Box>
            {/* Header with Logo */}
            <Box sx={{ mb: 4 }}>
              <MusicNote
                sx={{
                  fontSize: 48,
                  color: 'primary.main',
                  mb: 2
                }}
              />
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                unwrapped.fm
              </Typography>
            </Box>

            {/* Error Message */}
            {error && (
              <Alert
                severity="error"
                onClose={clearError}
                sx={{ mb: 3, textAlign: 'left' }}
              >
                {error}
              </Alert>
            )}

            {/* Main Content */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2,
                }}
              >
                Your friends think your taste in music is trash.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Connect to your Spotify and we'll be the judge of that.
              </Typography>

              {/* Judge Me Button */}
              <Button
                variant="contained"
                size="large"
                onClick={handleJudgeMe}
                disabled={isLoading}
                startIcon={<Headphones />}
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  py: 2,
                  px: 4,
                  mb: 3,
                  background: 'linear-gradient(45deg, #1DB954 30%, #1ed760 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1ed760 30%, #4caf50 90%)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                {isLoading ? 'Connecting...' : 'Judge me'}
              </Button>
            </Box>

            {/* Privacy Notice */}
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontStyle: 'italic',
              }}
            >
              We do not store any of your listening data.
              <br />
              We use it to judge you and then throw it away.
            </Typography>
          </Box>
        </Fade>
      </DialogContent>
    </Dialog>
  );
}
