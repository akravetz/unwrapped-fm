'use client';

import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface LoginButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  showIcon?: boolean;
}

export function LoginButton({
  variant = 'contained',
  size = 'large',
  fullWidth = false,
  showIcon = true
}: LoginButtonProps) {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    await login();
  };

  return (
    <Box>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleLogin}
        disabled={isLoading}
        sx={{
          py: 1.5,
          px: 4,
          fontSize: '1.1rem',
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: 3,
          background: variant === 'contained'
            ? 'linear-gradient(45deg, #1DB954 30%, #1ED760 90%)'
            : undefined,
          '&:hover': {
            background: variant === 'contained'
              ? 'linear-gradient(45deg, #1AA34A 30%, #1DB954 90%)'
              : undefined,
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {showIcon && (
          <Box
            component="span"
            sx={{
              mr: 1,
              fontSize: '1.2rem',
            }}
          >
            🎵
          </Box>
        )}
        {isLoading ? 'Connecting...' : 'Connect with Spotify'}
      </Button>

      {error && (
        <Typography
          variant="body2"
          color="error"
          sx={{ mt: 1, textAlign: 'center' }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default LoginButton;
