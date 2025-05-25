import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProfile } from './components/UserProfile';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';

function LandingPage() {
  const { login, isLoading, error, clearError } = useAuth();

  const handleConnectSpotify = async () => {
    await login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Error Message */}
          {error && (
            <ErrorMessage message={error} onDismiss={clearError} />
          )}

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎵 unwrapped.fm
          </h1>
          <p className="text-gray-600 mb-8">
            Let AI analyze your Spotify listening history and judge your music taste.
            Get personalized insights and shareable results!
          </p>

          <button
            onClick={handleConnectSpotify}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>🎧</span>
                <span>Connect with Spotify</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            We'll only access your music listening history. Your data stays secure.
          </p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Setting up your account..." />;
  }

  if (isAuthenticated && user) {
    return <UserProfile user={user} />;
  }

  return <LandingPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
