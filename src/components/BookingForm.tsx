'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AllowedDuration, Booking, TimeSlotInfo } from '@/lib/types/booking';
import { ALLOWED_DURATIONS, generateTimelineSlots, validateBookingRequest } from '@/lib/booking/logic';
import { Clock, User, Calendar, AlertCircle, CheckCircle2, Loader2, Info, ChevronDown, Check } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { HOST_TIMEZONE } from '@/lib/booking/logic';
import CalendarPicker from './CalendarPicker';

interface BookingFormProps {
  dateISO: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  bookings: Booking[];
  onBookingCreated: () => void;
  editingBooking?: Booking | null;
  onCancelEdit?: () => void;
}

export default function BookingForm({ dateISO, selectedDate, onDateChange, bookings, onBookingCreated, editingBooking, onCancelEdit }: BookingFormProps) {
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

  useEffect(() => {
    if (!editingBooking) {
      const sessionEmail = localStorage.getItem('meetplot_session');
      if (sessionEmail) {
        const namePart = sessionEmail.split('@')[0];
        const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        setName(capitalized);
      }
    }
  }, [editingBooking]);

  useEffect(() => {
    if (editingBooking) {
      setName(editingBooking.name);
      setDuration(editingBooking.duration as AllowedDuration);
      setSelectedStartTime(editingBooking.start_time);
      
      const localDate = formatInTimeZone(new Date(editingBooking.start_time), HOST_TIMEZONE, 'yyyy-MM-dd');
      if (localDate !== selectedDate) {
        onDateChange(localDate);
      }
    }
  }, [editingBooking]); // Deliberately omit selectedDate to avoid infinite loop

  const relevantBookings = editingBooking 
    ? bookings.filter(b => b.id !== editingBooking.id)
    : bookings;

  // Generate timeline slots for slot selection
  const slots: TimeSlotInfo[] = generateTimelineSlots(dateISO, relevantBookings);

  // Filter available slots that can fit selected duration
  const availableSlots = slots.filter((slot) => {
    // Basic test if slot can start a meeting
    const val = validateBookingRequest(
      { name: 'Preview', start_time: slot.isoTime, duration },
      relevantBookings
    );
    return val.isValid;
  });

  // Reset selected start time if current selection becomes invalid
  useEffect(() => {
    if (editingBooking) return; // Don't reset if we are editing
    if (availableSlots.length > 0 && !availableSlots.some((s) => s.isoTime === selectedStartTime)) {
      setSelectedStartTime(availableSlots[0].isoTime);
    } else if (availableSlots.length === 0) {
      setSelectedStartTime('');
    }
  }, [duration, dateISO, relevantBookings, editingBooking]);

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
      const method = editingBooking ? 'PATCH' : 'POST';
      const url = editingBooking ? `/api/bookings/${editingBooking.id}` : '/api/bookings';
      
      const res = await fetch(url, {
        method,
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
        setErrorMsg(data.error || `Failed to ${editingBooking ? 'update' : 'create'} booking.`);
      } else {
        setSuccessMsg(editingBooking ? 'Booking updated successfully!' : `Booking confirmed for ${data.booking.name}!`);
        setName('');
        if (editingBooking && onCancelEdit) {
          onCancelEdit();
        }
        onBookingCreated();
      }
    } catch (err: any) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-20 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-black text-white rounded-xl">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{editingBooking ? 'Update Booking' : 'New Booking'}</h2>
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
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="name-input"
              type="text"
              required
              placeholder="e.g., Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800/20 focus:border-slate-800 transition-all placeholder:text-slate-400"
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
                    ? 'bg-slate-800 text-white border-slate-800 ring-2 ring-slate-800/20'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800'
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
              className={`w-full flex items-center justify-between pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDropdownOpen ? 'border-slate-800 ring-1 ring-slate-800/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <span className={selectedStartTime ? 'text-slate-800' : 'text-slate-500'}>
                  {availableSlots.length === 0 
                    ? `No slots available for ${duration} min meeting`
                    : selectedStartTime 
                      ? availableSlots.find(s => s.isoTime === selectedStartTime)?.time || 'Select a time...'
                      : 'Select a time...'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && availableSlots.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
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
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between group transition-colors ${
                        isSelected 
                          ? 'bg-orange-400 text-slate-900 font-semibold' 
                          : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
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

        {/* Submit Button */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !name || !selectedStartTime}
            className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 shadow-md shadow-black/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {editingBooking ? 'Updating...' : 'Scheduling...'}
              </>
            ) : (
              editingBooking ? 'Save Changes' : 'Confirm Booking'
            )}
          </button>
          
          {editingBooking && onCancelEdit && (
             <button
               type="button"
               onClick={onCancelEdit}
               className="px-6 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-xl font-semibold text-sm transition-colors border border-transparent"
             >
               Cancel
             </button>
          )}
        </div>
      </form>
    </div>
  );
}
