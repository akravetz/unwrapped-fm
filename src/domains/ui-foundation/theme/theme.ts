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
      fontSize: '3rem',
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
      fontWeight: 500,
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
      lineHeight: 1.6,
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
          borderRadius: 24,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(29, 185, 84, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #1DB954 30%, #1ED760 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1AA34A 30%, #1DB954 90%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#181818',
          borderRadius: 16,
          border: '1px solid #282828',
          '&:hover': {
            borderColor: '#404040',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212',
          borderBottom: '1px solid #282828',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#181818',
            '& fieldset': {
              borderColor: '#404040',
            },
            '&:hover fieldset': {
              borderColor: '#1DB954',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1DB954',
            },
          },
        },
      },
    },
  },
});

export default theme;
