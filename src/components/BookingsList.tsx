'use client';

import React, { useState } from 'react';
import { Booking } from '@/lib/types/booking';
import { CalendarDays, Clock, User, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { HOST_TIMEZONE } from '@/lib/booking/logic';

interface BookingsListProps {
  bookings: Booking[];
  onBookingCanceled: () => void;
}

export default function BookingsList({ bookings, onBookingCanceled }: BookingsListProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Safely format time
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return formatInTimeZone(d, HOST_TIMEZONE, 'h:mm a');
  };

  const handleCancel = async (id: string, name: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setCancelingId(id);

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        setErrorMsg('Failed to parse server response. The server might be down.');
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to cancel booking.');
      } else {
        setSuccessMsg(`Booking for ${name} canceled. Available time restored!`);
        onBookingCanceled();
      }
    } catch (err) {
      setErrorMsg('Network error while canceling.');
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <span>Active Bookings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Chronologically ordered active schedule</p>
        </div>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
          {bookings.length} {bookings.length === 1 ? 'Meeting' : 'Meetings'}
        </span>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50/60 border border-dashed border-slate-200 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 mx-auto flex items-center justify-center mb-3">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No Meetings Booked</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            There are no meetings scheduled. Select an available time slot above to create your first booking!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-bold text-slate-800 text-base">{booking.name}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-semibold rounded-md">
                    {booking.duration} mins
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 pl-6">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {formatTime(booking.start_time)} → {formatTime(booking.end_time)}
                  </span>
                </div>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => handleCancel(booking.id, booking.name)}
                disabled={cancelingId === booking.id}
                title="Cancel this booking and free up the time slot"
                className="self-end sm:self-center px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {cancelingId === booking.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Canceling...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
