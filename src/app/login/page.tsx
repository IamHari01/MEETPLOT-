'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Loader2, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot_password';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to login');
        }
        
        localStorage.setItem('meetplot_session', email);
        router.push('/dashboard');
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to sign up');
        }
        
        localStorage.setItem('meetplot_session', email);
        router.push('/dashboard');
      } else if (mode === 'forgot_password') {
        // Mock forgot password since there's no actual email service
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccessMsg('Password reset instructions sent to your email.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === 'login') return 'Sign in to MEETPLOT';
    if (mode === 'signup') return 'Create your account';
    return 'Reset Password';
  };

  const getSubtitle = () => {
    if (mode === 'login') return 'Welcome back to your scheduling hub.';
    if (mode === 'signup') return 'Start managing your meetings like a pro.';
    return 'Enter your email to receive reset instructions.';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900 mb-6">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {getTitle()}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {getSubtitle()}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-sm font-medium border border-rose-200">
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
                {successMsg}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-800 focus:border-slate-800 sm:text-sm"
                />
              </div>
            </div>

            {mode !== 'forgot_password' && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-800 focus:border-slate-800 sm:text-sm"
                  />
                </div>
                {mode === 'login' && (
                  <div className="flex items-center justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
                {mode === 'signup' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                    <div className="mt-1">
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-800 focus:border-slate-800 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
            </button>
          </form>

          {mode === 'forgot_password' ? (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">
                    {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError(null);
                    setSuccessMsg(null);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {mode === 'login' ? 'Create an account' : 'Sign in to existing account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
