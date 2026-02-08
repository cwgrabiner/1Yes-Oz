'use client';

import { useEffect } from 'react';

interface ErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export default function ErrorBanner({ error, onDismiss, onRetry }: ErrorBannerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && error) {
        onDismiss();
      }
    };

    if (error) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [error, onDismiss]);

  if (!error) return null;

  return (
    <div className="border-b border-red-900/30 bg-red-950/10 px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-red-400/80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-red-300/90">Something went wrong. Please try again.</span>
        </div>
        <div className="flex items-center gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded px-3 py-1.5 text-sm font-medium text-red-300/90 transition-colors duration-200 hover:bg-red-900/20 hover:text-red-200"
            >
              Retry
            </button>
          )}
          <button
            onClick={onDismiss}
            className="rounded px-3 py-1.5 text-sm font-medium text-red-300/90 transition-colors duration-200 hover:bg-red-900/20 hover:text-red-200"
          >
            {onRetry ? 'Dismiss' : 'Try again'}
          </button>
          <button
            onClick={onDismiss}
            className="rounded p-1 text-red-400/60 transition-colors duration-200 hover:bg-red-900/20 hover:text-red-300"
            aria-label="Dismiss"
          >
            <svg
              className="h-4 w-4"
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
    </div>
  );
}
