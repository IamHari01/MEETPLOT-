'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuthClient as supabase } from '@/lib/supabase/client';
import { Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem('meetplot_session');
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500 selection:text-white flex flex-col">
      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-50 px-6 py-6 max-w-7xl mx-auto flex justify-between items-center w-full">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-sm">
          <Logo className="w-6 h-6" />
          <span className="font-bold tracking-wider">MEETPLOT</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link 
            href="/login" 
            className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-6 pt-32 pb-20 overflow-hidden">
        
        {/* Abstract Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            MEETPLOT
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
            Schedule meetings effortlessly. Experience a premium, frictionless booking experience designed for modern professionals.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              href="/login" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Mockup Preview Area */}
        <div className="relative z-10 mt-24 w-full max-w-5xl mx-auto">
          <div className="aspect-[16/9] rounded-2xl md:rounded-[2rem] bg-slate-900/50 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden p-2 flex flex-col">
            <div className="h-6 w-full flex items-center px-4 gap-2 border-b border-white/5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
            </div>
            
            <div className="flex-1 w-full bg-slate-950 rounded-xl md:rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
               <Calendar className="w-16 h-16 text-slate-700/50 absolute" />
               <div className="z-10 text-slate-500 font-medium">Your Dashboard Awaits</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
