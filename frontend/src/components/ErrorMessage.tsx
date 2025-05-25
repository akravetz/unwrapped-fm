interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-red-500">⚠️</span>
          <p className="text-red-700 text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors"
          aria-label="Dismiss error"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
