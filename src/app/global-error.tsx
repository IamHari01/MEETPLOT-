'use client';

import React from 'react';
import { AlertOctagon } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Fatal Application Error</h2>
              <p className="text-sm text-slate-600">
                {error.message || 'A critical error prevented the application from loading.'}
              </p>
            </div>
            <button
              onClick={() => reset()}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              Restart Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
