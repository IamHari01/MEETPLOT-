'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AllowedDuration, Booking, TimeSlotInfo } from '@/lib/types/booking';
import { ALLOWED_DURATIONS, generateTimelineSlots, validateBookingRequest } from '@/lib/booking/logic';
import { Clock, User, Calendar, AlertCircle, CheckCircle2, Loader2, Info, ChevronDown, Check } from 'lucide-react';
import CalendarPicker from './CalendarPicker';

interface BookingFormProps {
  dateISO: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  bookings: Booking[];
  onBookingCreated: () => void;
}

export default function BookingForm({ dateISO, selectedDate, onDateChange, bookings, onBookingCreated }: BookingFormProps) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<AllowedDuration>(30);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate timeline slots for slot selection
  const slots: TimeSlotInfo[] = generateTimelineSlots(dateISO, bookings);

  // Filter available slots that can fit selected duration
  const availableSlots = slots.filter((slot) => {
    // Basic test if slot can start a meeting
    const val = validateBookingRequest(
      { name: 'Preview', start_time: slot.isoTime, duration },
      bookings
    );
    return val.isValid;
  });

  // Reset selected start time if current selection becomes invalid
  useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.some((s) => s.isoTime === selectedStartTime)) {
      setSelectedStartTime(availableSlots[0].isoTime);
    } else if (availableSlots.length === 0) {
      setSelectedStartTime('');
    }
  }, [duration, dateISO, bookings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Client-side quick check
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    if (!selectedStartTime) {
      setErrorMsg('Please select an available start time.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          start_time: selectedStartTime,
          duration,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        setErrorMsg('Failed to parse server response. The server might be down.');
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to create booking.');
      } else {
        setSuccessMsg(`Booking confirmed for ${data.booking.name}!`);
        setName('');
        onBookingCreated();
      }
    } catch (err: any) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-20 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">New Booking</h2>
          <p className="text-xs text-slate-500">9:00 AM - 6:00 PM (IST) • Mandatory 15-min Buffer</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Booking Failed</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Input */}
        <div>
          <label htmlFor="name-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Your Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="name-input"
              type="text"
              required
              placeholder="e.g., Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Duration Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Meeting Duration <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {ALLOWED_DURATIONS.map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => setDuration(dur)}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center justify-center gap-1 ${duration === dur
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
              >
                <span>{dur} mins</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Date <span className="text-rose-500">*</span>
          </label>
          <CalendarPicker selectedDate={selectedDate} onDateChange={onDateChange} />
        </div>

        {/* Start Time Picker */}
        <div>
          <label htmlFor="start-time-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Start Time <span className="text-rose-500">*</span>
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={availableSlots.length === 0}
              className={`w-full flex items-center justify-between pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <span className={selectedStartTime ? 'text-slate-800' : 'text-slate-500'}>
                  {availableSlots.length === 0 
                    ? `No slots available for ${duration} min meeting`
                    : selectedStartTime 
                      ? availableSlots.find(s => s.isoTime === selectedStartTime)?.time || 'Select a time...'
                      : 'Select a time...'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && availableSlots.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 py-1.5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                {availableSlots.map((slot) => {
                  const isSelected = slot.isoTime === selectedStartTime;
                  return (
                    <button
                      key={slot.isoTime}
                      type="button"
                      onClick={() => {
                        setSelectedStartTime(slot.isoTime);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-blue-50/50 text-blue-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span>{slot.time}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {availableSlots.length > 0 && (
            <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Only start times with a 15-min free buffer before & after are selectable.</span>
            </p>
          )}
        </div>

        {/* Submit Button - MUST BE NAMED `SUBMITS` */}
        <button
          type="submit"
          id="submit-booking-btn"
          disabled={isSubmitting || availableSlots.length === 0}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>SUBMITTING...</span>
            </>
          ) : (
            <span>SUBMIT</span>
          )}
        </button>
      </form>
    </div>
  );
}
