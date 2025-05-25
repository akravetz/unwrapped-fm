import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Divider,
} from '@mui/material';
import { MusicNote } from '@mui/icons-material';
import { QuadrantGraph } from './ui/QuadrantGraph';
import { apiClient } from '../utils/api';
import type { PublicAnalysisResult } from '../types/analysis';

export function PublicAnalysisView() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [analysis, setAnalysis] = useState<PublicAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!shareToken) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        const result = await apiClient.getSharedAnalysis(shareToken);
        setAnalysis(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [shareToken]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading music analysis...
        </Typography>
      </Container>
    );
  }

  if (error || !analysis) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Analysis not found'}
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            This analysis link may be invalid or expired
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try getting a new analysis at unwrapped.fm
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 4,
      }}>
        <MusicNote sx={{ color: 'primary.main', mr: 1 }} />
        <Typography variant="h4" fontWeight={600}>
          unwrapped.fm
        </Typography>
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
      }}>
        {/* Left Column - Rating */}
        <Box sx={{ flex: 1 }}>
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
                {analysis.rating_text}
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
                {analysis.rating_description}
              </Typography>

              {/* Sample tags/genres */}
              <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip label="Shared Analysis" size="small" variant="outlined" color="primary" />
                <Chip label="Public View" size="small" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Graph */}
        <Box sx={{ flex: 1 }}>
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
                Musical Position
              </Typography>

              <QuadrantGraph
                x={analysis.x_axis_pos}
                y={analysis.y_axis_pos}
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
                Based on listening patterns, musical diversity, and taste preferences
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{
        mt: 4,
        textAlign: 'center',
        p: 3,
        borderTop: 1,
        borderColor: 'divider',
      }}>
        <Typography variant="body2" color="text.secondary">
          Want your own music taste analysis? Visit{' '}
          <Typography
            component="a"
            href="/"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            unwrapped.fm
          </Typography>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Analyzed on {new Date(analysis.analyzed_at).toLocaleDateString()}
        </Typography>
      </Box>
    </Container>
  );
}
