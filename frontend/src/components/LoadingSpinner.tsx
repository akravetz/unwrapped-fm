interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {message}
          </h2>
          <p className="text-gray-600">
            Please wait while we set things up for you.
          </p>
        </div>
      </div>
    </div>
  );
}
