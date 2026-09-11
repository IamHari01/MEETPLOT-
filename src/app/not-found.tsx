import React from 'react';
import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <SearchX className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h2>
          <p className="text-sm text-slate-600">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link href="/" className="inline-flex w-full justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
