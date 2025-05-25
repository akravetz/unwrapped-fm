import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AnalysisContextType, AnalysisState } from '../types/analysis';
import { LOADING_MESSAGES } from '../types/analysis';
import { apiClient } from '../utils/api';

const AnalysisContext = createContext<AnalysisContextType | null>(null);

interface AnalysisProviderProps {
  children: ReactNode;
}

export function AnalysisProvider({ children }: AnalysisProviderProps) {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    stage: 'login',
    isAnalyzing: false,
    analysisResult: null,
    loadingMessages: LOADING_MESSAGES,
    currentMessageIndex: 0,
    error: null,
    progress: 0,
  });

  // Rotate loading messages every 3 seconds during analysis
  useEffect(() => {
    if (analysisState.stage === 'loading' && analysisState.isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisState(prev => ({
          ...prev,
          currentMessageIndex: (prev.currentMessageIndex + 1) % prev.loadingMessages.length,
          progress: Math.min(prev.progress + Math.random() * 15, 95), // Gradually increase progress
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [analysisState.stage, analysisState.isAnalyzing]);

  const startAnalysis = useCallback(async () => {
    try {
      setAnalysisState(prev => ({
        ...prev,
        stage: 'loading',
        isAnalyzing: true,
        error: null,
        progress: 10,
        currentMessageIndex: 0,
      }));

      // Call the analysis API
      const result = await apiClient.analyzeMusic();

      // Complete the progress
      setAnalysisState(prev => ({
        ...prev,
        progress: 100,
      }));

      // Small delay to show completion, then show results
      setTimeout(() => {
        setAnalysisState(prev => ({
          ...prev,
          stage: 'results',
          isAnalyzing: false,
          analysisResult: result,
          progress: 100,
        }));
      }, 1000);

    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisState(prev => ({
        ...prev,
        stage: 'error',
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Analysis failed. Please try again.',
        progress: 0,
      }));
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setAnalysisState({
      stage: 'login',
      isAnalyzing: false,
      analysisResult: null,
      loadingMessages: LOADING_MESSAGES,
      currentMessageIndex: 0,
      error: null,
      progress: 0,
    });
  }, []);

  const clearError = useCallback(() => {
    setAnalysisState(prev => ({
      ...prev,
      error: null,
      stage: 'login',
    }));
  }, []);

  const nextLoadingMessage = useCallback(() => {
    setAnalysisState(prev => ({
      ...prev,
      currentMessageIndex: (prev.currentMessageIndex + 1) % prev.loadingMessages.length,
    }));
  }, []);

  // Listen for auth success to start analysis
  useEffect(() => {
    const handleAuthSuccess = () => {
      startAnalysis();
    };

    window.addEventListener('authSuccess', handleAuthSuccess);
    return () => window.removeEventListener('authSuccess', handleAuthSuccess);
  }, [startAnalysis]);

  const value: AnalysisContextType = {
    ...analysisState,
    startAnalysis,
    resetAnalysis,
    clearError,
    nextLoadingMessage,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisContextType {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
