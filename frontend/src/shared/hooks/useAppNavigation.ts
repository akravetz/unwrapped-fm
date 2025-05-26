'use client';

import { useState, useEffect } from 'react';
import { User, MusicAnalysisResponse } from '@/domains/authentication/types/auth.types';

export type AppScreen = 'login' | 'loading' | 'results';

interface UseAppNavigationProps {
  isAuthenticated: boolean;
  user: User | null;
  latestAnalysis: MusicAnalysisResponse | null;
  isLoading: boolean;
}

interface UseAppNavigationReturn {
  currentScreen: AppScreen;
  navigateToScreen: (screen: AppScreen) => void;
}

export function useAppNavigation({
  isAuthenticated,
  user,
  latestAnalysis,
  isLoading
}: UseAppNavigationProps): UseAppNavigationReturn {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('login');

  // Auto-route based on authentication and analysis state
  useEffect(() => {
    if (isAuthenticated && user) {
      if (latestAnalysis) {
        // User has existing results - go directly to results
        setCurrentScreen('results');
      } else {
        // User has no existing results - start analysis
        setCurrentScreen('loading');
      }
    } else if (!isAuthenticated && !isLoading) {
      // User not authenticated - show login
      setCurrentScreen('login');
    }
  }, [isAuthenticated, user, latestAnalysis, isLoading]);

  const navigateToScreen = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  return {
    currentScreen,
    navigateToScreen
  };
}
