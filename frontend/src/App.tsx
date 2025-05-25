
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AnalysisProvider, useAnalysis } from './contexts/AnalysisContext';
import { LoginModal } from './components/modals/LoginModal';
import { LoadingModal } from './components/modals/LoadingModal';
import { ResultsModal } from './components/modals/ResultsModal';
import { PublicAnalysisView } from './components/PublicAnalysisView';
import { theme } from './theme/theme';

function AppContent() {
  const { stage } = useAnalysis();

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Three Modal System */}
      <LoginModal open={stage === 'login'} />
      <LoadingModal open={stage === 'loading'} />
      <ResultsModal open={stage === 'results'} />

      {/* Error state could be handled here or within the modals */}
      {stage === 'error' && (
        <LoginModal open={true} />
      )}
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public analysis view route */}
        <Route path="/share/:shareToken" element={<PublicAnalysisView />} />

        {/* Main app route */}
        <Route path="/" element={
          <AuthProvider>
            <AnalysisProvider>
              <AppContent />
            </AnalysisProvider>
          </AuthProvider>
        } />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
