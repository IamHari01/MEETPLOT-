'use client';

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong!</h2>
          <p className="text-sm text-slate-600">
            {error.message || 'An unexpected error occurred while rendering this page.'}
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
