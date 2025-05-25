import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import './globals.css';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from '@/domains/authentication/context/AuthContext';
import { theme } from '@/domains/ui-foundation/theme/theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'unwrapped.fm - AI Music Taste Judge',
  description: 'Connect your Spotify and let AI judge your music taste. Get personalized insights and shareable results.',
  keywords: ['music', 'spotify', 'ai', 'music taste', 'analysis'],
  authors: [{ name: 'unwrapped.fm' }],
  openGraph: {
    title: 'unwrapped.fm - AI Music Taste Judge',
    description: 'Connect your Spotify and let AI judge your music taste',
    type: 'website',
    url: 'https://unwrapped.fm',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'unwrapped.fm - AI Music Taste Judge',
    description: 'Connect your Spotify and let AI judge your music taste',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
