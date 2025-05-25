'use client';

import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useAuth } from '@/domains/authentication';

interface LoginButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function LoginButton({
  variant = 'contained',
  size = 'large',
  fullWidth = false,
  onClick,
  children
}: LoginButtonProps) {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    if (onClick) {
      onClick();
    } else {
      await login();
    }
  };

  const buttonText = children || (isLoading ? 'Connecting...' : 'Judge Me');

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
          fontSize: size === 'large' ? '1.1rem' : undefined,
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: 3,
          background: variant === 'contained' ?
            'linear-gradient(45deg, #1DB954 30%, #1ED760 90%)' :
            undefined,
          '&:hover': {
            background: variant === 'contained' ?
              'linear-gradient(45deg, #1AA34A 30%, #1DB954 90%)' :
              undefined,
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {buttonText}
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
