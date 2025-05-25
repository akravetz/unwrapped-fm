'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Avatar,
  Slider,
  Chip,
  IconButton
} from '@mui/material';
import { Share, Twitter, Facebook, Link as LinkIcon } from '@mui/icons-material';

interface ResultsScreenProps {
  user: {
    display_name: string | null;
    profile_image_url: string | null;
  };
  rating: {
    category: string;
    score: number; // 0-100
    description: string;
  };
  onStartOver?: () => void;
}

export function ResultsScreen({ user, rating, onStartOver }: ResultsScreenProps) {
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const handleShare = (platform: 'twitter' | 'facebook' | 'copy') => {
    const shareText = `I just got rated "${rating.category}" on unwrapped.fm! ${rating.description}`;
    const shareUrl = 'https://unwrapped.fm';

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        // Could add a toast notification here
        break;
    }
    setShareMenuOpen(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#1DB954'; // Green
    if (score >= 60) return '#FF9500'; // Orange
    if (score >= 40) return '#E22134'; // Red
    return '#B3B3B3'; // Gray
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Critically Acclaimed';
    if (score >= 60) return 'Critically Concerning';
    if (score >= 40) return 'Obscure on Purpose';
    return 'Algorithm Victim';
  };

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
            maxWidth: 500,
            p: 4,
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <CardContent>
            <Stack spacing={4} alignItems="center">
              {/* Spotify Profile Picture */}
              {user.profile_image_url && (
                <Avatar
                  src={user.profile_image_url}
                  alt={user.display_name || 'User'}
                  sx={{
                    width: 80,
                    height: 80,
                    border: '3px solid',
                    borderColor: 'primary.main'
                  }}
                />
              )}

              {/* Title */}
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary'
                }}
              >
                PitchFork music rating:
              </Typography>

              {/* Rating Category */}
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 800,
                  color: getScoreColor(rating.score),
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
              >
                {rating.category}
              </Typography>

              {/* Description */}
              <Typography
                variant="body1"
                color="text.primary"
                sx={{
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  maxWidth: '400px'
                }}
              >
                {rating.description}
              </Typography>

              {/* Score Slider */}
              <Box sx={{ width: '100%', maxWidth: '300px', px: 2 }}>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Taste Score
                  </Typography>
                  <Slider
                    value={rating.score}
                    min={0}
                    max={100}
                    disabled
                    sx={{
                      '& .MuiSlider-thumb': {
                        backgroundColor: getScoreColor(rating.score),
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: getScoreColor(rating.score),
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: '#383838',
                      }
                    }}
                  />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Algorithm Victim
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Critically Acclaimed
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Score Label */}
              <Chip
                label={getScoreLabel(rating.score)}
                sx={{
                  backgroundColor: getScoreColor(rating.score),
                  color: 'white',
                  fontWeight: 600
                }}
              />

              {/* Share Button */}
              <Button
                variant="contained"
                size="large"
                startIcon={<Share />}
                onClick={() => setShareMenuOpen(!shareMenuOpen)}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 3,
                }}
              >
                Share Results
              </Button>

              {/* Share Menu */}
              {shareMenuOpen && (
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <IconButton
                    onClick={() => handleShare('twitter')}
                    sx={{
                      backgroundColor: '#1DA1F2',
                      color: 'white',
                      '&:hover': { backgroundColor: '#1a91da' }
                    }}
                  >
                    <Twitter />
                  </IconButton>
                  <IconButton
                    onClick={() => handleShare('facebook')}
                    sx={{
                      backgroundColor: '#4267B2',
                      color: 'white',
                      '&:hover': { backgroundColor: '#365899' }
                    }}
                  >
                    <Facebook />
                  </IconButton>
                  <IconButton
                    onClick={() => handleShare('copy')}
                    sx={{
                      backgroundColor: '#383838',
                      color: 'white',
                      '&:hover': { backgroundColor: '#484848' }
                    }}
                  >
                    <LinkIcon />
                  </IconButton>
                </Stack>
              )}

              {/* Website URL */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.875rem',
                  mt: 3
                }}
              >
                https://unwrapped.fm/share/Mq3890
              </Typography>

              {/* Start Over Button */}
              <Button
                variant="outlined"
                onClick={onStartOver}
                sx={{
                  mt: 2,
                  textTransform: 'none',
                  borderColor: 'text.secondary',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }
                }}
              >
                Judge Someone Else
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
