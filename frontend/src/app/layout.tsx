import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeRegistry } from "@/domains/ui-foundation/theme/ThemeRegistry";
import { AuthProvider } from "@/domains/authentication";
import { ErrorBoundary } from "@/shared/components";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "unwrapped.fm",
  description: "Your friends think your taste in music is trash. Connect to your Spotify and we'll analyze your music taste.",
  keywords: ["music", "spotify", "music taste", "analysis", "unwrapped"],
  authors: [{ name: "unwrapped.fm" }],
  openGraph: {
    title: "unwrapped.fm",
    description: "Connect your Spotify and get insights into your music taste",
    type: "website",
    url: "https://unwrapped.fm",
  },
  twitter: {
    card: "summary_large_image",
    title: "unwrapped.fm",
    description: "Connect your Spotify and get insights into your music taste",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1DB954",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <ErrorBoundary>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ErrorBoundary>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
