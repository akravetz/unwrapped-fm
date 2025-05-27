'use client'

import React from 'react'
import { Box, Typography, Stack } from '@mui/material'

interface MusicScoreBarProps {
  score: number // 0.0 to 1.0
  leftLabel: string
  rightLabel: string
  color?: 'primary' | 'secondary'
}

export function MusicScoreBar({
  score,
  leftLabel,
  rightLabel,
  color = 'primary'
}: MusicScoreBarProps) {
  // Clamp score to 0-1 range
  const clampedScore = Math.max(0, Math.min(1, score))
  const fillPercentage = clampedScore * 100

  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {leftLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {rightLabel}
        </Typography>
      </Stack>

      <Box
        sx={{
          width: '100%',
          height: 24,
          backgroundColor: 'grey.200',
          borderRadius: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${fillPercentage}%`,
            height: '100%',
            backgroundColor: color === 'primary' ? 'primary.main' : 'secondary.main',
            borderRadius: 1,
            transition: 'width 0.3s ease-in-out',
          }}
        />
      </Box>
    </Stack>
  )
}
