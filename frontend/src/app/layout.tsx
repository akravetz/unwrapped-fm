import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeRegistry } from '@/domains/ui-foundation/theme/ThemeRegistry'
import { AuthProvider } from '@/domains/authentication/context/AuthContext'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Unwrapped.fm - AI-Powered Music Analysis",
  description: "Discover your music listening patterns and get AI-powered insights into your Spotify data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ErrorBoundary>
          <ThemeRegistry>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeRegistry>
        </ErrorBoundary>
      </body>
    </html>
  );
}
