import type { User } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* User Avatar */}
          <div className="mb-6">
            {user.image_url ? (
              <img
                src={user.image_url}
                alt={user.display_name || 'User'}
                className="w-24 h-24 rounded-full mx-auto border-4 border-green-500 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto bg-green-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {(user.display_name || user.email)?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          {/* User Info */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back!
          </h1>
          <h2 className="text-xl text-gray-600 mb-1">
            {user.display_name || 'Music Lover'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {user.email}
          </p>

          {/* Status Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <span className="text-green-500">🎧</span>
              <span className="font-medium">Spotify Connected</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Ready to analyze your music taste!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
              <span>🎵</span>
              <span>Analyze My Music Taste</span>
            </button>

            <button
              onClick={logout}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>

          {/* User Details */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Country</p>
                <p className="font-medium">{user.country || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-500">Member Since</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
