
import { Box, Typography, useTheme } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';

interface QuadrantGraphProps {
  x: number; // -1.0 to 1.0
  y: number; // -1.0 to 1.0
  size?: number;
}

export function QuadrantGraph({ x, y, size = 300 }: QuadrantGraphProps) {
  const theme = useTheme();

  // Convert coordinates from -1,1 range to pixel positions
  const centerX = size / 2;
  const centerY = size / 2;
  const dotX = centerX + (x * (size / 2 - 20)); // -20 for padding
  const dotY = centerY - (y * (size / 2 - 20)); // Invert Y for SVG coordinates

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <svg width={size} height={size} style={{ border: `2px solid ${theme.palette.divider}`, borderRadius: 8 }}>
          {/* Background */}
          <rect width={size} height={size} fill={theme.palette.background.paper} />

          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={theme.palette.divider} strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width={size} height={size} fill="url(#grid)" />

          {/* Quadrant lines */}
          <line
            x1={centerX}
            y1={0}
            x2={centerX}
            y2={size}
            stroke={theme.palette.text.secondary}
            strokeWidth="2"
            opacity="0.6"
          />
          <line
            x1={0}
            y1={centerY}
            x2={size}
            y2={centerY}
            stroke={theme.palette.text.secondary}
            strokeWidth="2"
            opacity="0.6"
          />

          {/* Quadrant labels */}
          <text
            x={centerX - 60}
            y={30}
            fill={theme.palette.text.secondary}
            fontSize="12"
            textAnchor="middle"
            fontWeight="500"
          >
            Critically Concerning
          </text>
          <text
            x={centerX + 60}
            y={30}
            fill={theme.palette.text.secondary}
            fontSize="12"
            textAnchor="middle"
            fontWeight="500"
          >
            Critically Acclaimed
          </text>
          <text
            x={centerX - 60}
            y={size - 15}
            fill={theme.palette.text.secondary}
            fontSize="12"
            textAnchor="middle"
            fontWeight="500"
          >
            Algorithm Victim
          </text>
          <text
            x={centerX + 60}
            y={size - 15}
            fill={theme.palette.text.secondary}
            fontSize="12"
            textAnchor="middle"
            fontWeight="500"
          >
            Obscure on Purpose
          </text>

          {/* Axis labels */}
          <text
            x={size - 10}
            y={centerY - 10}
            fill={theme.palette.text.secondary}
            fontSize="10"
            textAnchor="end"
            fontWeight="500"
          >
            →
          </text>
          <text
            x={centerX + 5}
            y={15}
            fill={theme.palette.text.secondary}
            fontSize="10"
            textAnchor="start"
            fontWeight="500"
          >
            ↑
          </text>

          {/* User position dot */}
          <circle
            cx={dotX}
            cy={dotY}
            r="8"
            fill={theme.palette.primary.main}
            stroke={theme.palette.background.paper}
            strokeWidth="3"
          />

          {/* Pulse animation around dot */}
          <circle
            cx={dotX}
            cy={dotY}
            r="8"
            fill="none"
            stroke={theme.palette.primary.main}
            strokeWidth="2"
            opacity="0.6"
          >
            <animate
              attributeName="r"
              values="8;16;8"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>

        {/* Spotify profile link */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
            padding: '4px 8px',
            fontSize: '0.75rem',
            color: theme.palette.text.secondary,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FiberManualRecord sx={{ fontSize: 8, color: theme.palette.primary.main }} />
            Spotify profile pic here
          </Typography>
        </Box>
      </Box>

      {/* Coordinates display */}
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          fontFamily: 'monospace',
        }}
      >
        Position: ({x.toFixed(1)}, {y.toFixed(1)})
      </Typography>
    </Box>
  );
}
