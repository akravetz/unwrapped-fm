'use client';

import React from 'react';
import { useAuth } from '@/domains/authentication';
import { LoadingScreen } from '@/domains/music-analysis';
import { ResultsScreen } from '@/domains/results-sharing';
import { LoginScreen } from './LoginScreen';
import { useAppNavigation } from '../hooks/useAppNavigation';

export function AppRouter() {
  const { isAuthenticated, user, isLoading, latestAnalysis } = useAuth();
  const { currentScreen, navigateToScreen } = useAppNavigation({
    isAuthenticated,
    user,
    latestAnalysis,
    isLoading
  });

  switch (currentScreen) {
    case 'loading':
      return (
        <LoadingScreen
          onComplete={() => navigateToScreen('results')}
        />
      );

    case 'results':
      return (
        <ResultsScreen
          analysis={latestAnalysis}
          onAnalyzeAgain={() => navigateToScreen('loading')}
          onStartOver={() => navigateToScreen('login')}
        />
      );

    default:
      return <LoginScreen />;
  }
}
