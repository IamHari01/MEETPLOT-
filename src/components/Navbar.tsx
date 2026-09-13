'use client';

import React, { useState, useEffect } from 'react';
import { User, ChevronDown, LogOut } from 'lucide-react';
import Logo from '@/components/Logo';
import { supabaseDbClient as supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const sessionEmail = localStorage.getItem('meetplot_session');
    if (sessionEmail) {
      const namePart = sessionEmail.split('@')[0];
      const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      setUserName(capitalized);
    }
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('meetplot_session');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
          <Logo className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">
            MEETPLOT
          </h1>
        </div>

        {/* Auth Navigation */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-full hover:bg-white/10 transition-colors pr-3"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-300" />
            </div>
            {userName && (
              <span className="text-sm font-medium text-slate-200">{userName}</span>
            )}
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden text-slate-900 z-50">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 transition-colors text-left text-sm font-medium text-rose-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
