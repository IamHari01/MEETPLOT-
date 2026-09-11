'use client';

import React from 'react';
import { Calendar, Clock, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function Navbar({ selectedDate, onDateChange }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-md shadow-blue-500/20">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                SlotSync Pro
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                15m Buffer Protection
              </span>
            </div>
            <p className="text-xs text-slate-400">Production Meeting Slot Scheduler (9:00 AM – 6:00 PM)</p>
          </div>
        </div>

        {/* Date Selector & Operating Hours Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>9:00 AM – 6:00 PM</span>
          </div>

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="px-3 py-1.5 bg-blue-600/20 border border-blue-500/40 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
