'use client'

import React from 'react'
import { Button, CircularProgress } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { COPY } from '@/lib/constants/copy'

interface LoginButtonProps {
  variant?: 'contained' | 'outlined' | 'text'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
}

export function LoginButton({
  variant = 'contained',
  size = 'medium',
  fullWidth = false
}: LoginButtonProps) {
  const { login, isLoading } = useAuth()

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={login}
      disabled={isLoading}
      startIcon={isLoading ? <CircularProgress size={16} /> : null}
    >
      {isLoading ? COPY.AUTH.LOGIN_BUTTON_CONNECTING : COPY.AUTH.LOGIN_BUTTON}
    </Button>
  )
}
