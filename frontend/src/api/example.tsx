'use client';

import { useEffect, useState } from 'react';
import { useApiClient } from './client';
import type { components } from './generated/types';

type User = components['schemas']['UserRead'];
type AnalysisStatus = components['schemas']['AnalysisStatusResponse'];

/**
 * Example component demonstrating API client usage
 */
export function ApiClientExample() {
  const apiClient = useApiClient();
  const [user, setUser] = useState<User | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiClient) return; // SSR-safe check

    // Example: Get current user
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getCurrentUser();
        if (response.data) {
          setUser(response.data);
        }
      } catch (err) {
        setError('Failed to fetch user');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [apiClient]);

  const handleBeginAnalysis = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      setError(null);

      // Begin analysis
      const beginResponse = await apiClient.beginMusicAnalysis();
      console.log('Analysis begun:', beginResponse.data);

      // Poll for status
      const statusResponse = await apiClient.getMusicAnalysisStatus();
      if (statusResponse.data) {
        setAnalysisStatus(statusResponse.data);
      }
    } catch (err) {
      setError('Failed to begin analysis');
      console.error('Error beginning analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetLatestAnalysis = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getLatestMusicAnalysis();
      console.log('Latest analysis:', response.data);
    } catch (err) {
      setError('Failed to get latest analysis');
      console.error('Error getting latest analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!apiClient) {
    return <div>Loading API client...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Client Example</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Current User</h2>
          {loading ? (
            <p>Loading...</p>
          ) : user ? (
            <div>
              <p><strong>Display Name:</strong> {user.display_name || 'N/A'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Country:</strong> {user.country || 'N/A'}</p>
              <p><strong>Spotify ID:</strong> {user.spotify_id}</p>
            </div>
          ) : (
            <p>No user data available</p>
          )}
        </div>

        {/* Analysis Status */}
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Analysis Status</h2>
          {analysisStatus ? (
            <div>
              <p><strong>Status:</strong> {analysisStatus.status}</p>
              <p><strong>Analysis ID:</strong> {analysisStatus.analysis_id}</p>
              <p><strong>Created:</strong> {new Date(analysisStatus.created_at).toLocaleString()}</p>
              {analysisStatus.error_message && (
                <p><strong>Error:</strong> {analysisStatus.error_message}</p>
              )}
            </div>
          ) : (
            <p>No analysis status available</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleBeginAnalysis}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Begin Music Analysis'}
          </button>

          <button
            onClick={handleGetLatestAnalysis}
            disabled={loading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 ml-2"
          >
            {loading ? 'Loading...' : 'Get Latest Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
}
