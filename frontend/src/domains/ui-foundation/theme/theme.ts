'use client';

import { createTheme } from '@mui/material/styles';

// Music-focused color palette inspired by Spotify
const colors = {
  primary: {
    main: '#1DB954', // Spotify green
    light: '#1ED760',
    dark: '#1AA34A',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#191414', // Spotify black
    light: '#282828',
    dark: '#000000',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#121212', // Dark background
    paper: '#181818',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
  },
  error: {
    main: '#E22134',
  },
  warning: {
    main: '#FF9500',
  },
  info: {
    main: '#1DB954',
  },
  success: {
    main: '#1DB954',
  },
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    ...colors,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(29, 185, 84, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#181818',
          border: '1px solid #282828',
          '&:hover': {
            backgroundColor: '#1f1f1f',
            borderColor: '#383838',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#282828',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#383838',
          },
        },
        outlined: {
          borderColor: '#383838',
          '&:hover': {
            backgroundColor: '#282828',
            borderColor: '#1DB954',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width: 600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
        },
      },
    },
  },
});
