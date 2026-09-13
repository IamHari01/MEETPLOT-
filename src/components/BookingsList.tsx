'use client';

import React, { useState } from 'react';
import { Booking } from '@/lib/types/booking';
import { CalendarDays, Clock, User, Trash2, Loader2, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { HOST_TIMEZONE } from '@/lib/booking/logic';

interface BookingsListProps {
  bookings: Booking[];
  onBookingCanceled: () => void;
  onBookingEdit: (booking: Booking) => void;
}

export default function BookingsList({ bookings, onBookingCanceled, onBookingEdit }: BookingsListProps) {
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
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-slate-800" />
            <span>Active Bookings</span>
          </h2>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">
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
        <div className="text-center py-12 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Meetings Booked</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            There are no meetings scheduled. Select an available time slot above to create your first booking!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const isExpired = new Date(booking.end_time).getTime() < new Date().getTime();
            
            return (
            <div
              key={booking.id}
              className={`relative border rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group overflow-hidden pl-5 pr-4 py-4 ${
                isExpired 
                  ? 'bg-slate-50 border-slate-100 opacity-60 grayscale' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Left Border Accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isExpired ? 'bg-slate-300' : 'bg-orange-400'}`}></div>
              
              <div className="flex gap-4 items-start w-full">
                <div className="mt-1">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center text-transparent transition-colors ${isExpired ? 'border-slate-300' : 'border-slate-300 hover:border-orange-400 hover:text-orange-400 cursor-pointer'}`}>
                    <CheckCircle2 className="w-3 h-3 opacity-0 hover:opacity-100" />
                  </div>
                </div>
                <div className="space-y-1.5 flex-1">
                  <div>
                    <span className={`font-bold text-base block ${isExpired ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {booking.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-0.5">
                      <span>{booking.duration} mins</span>
                      <span>&bull;</span>
                      <span>Zoom</span>
                      <span>&bull;</span>
                      <span>One-on-One</span>
                      {isExpired && (
                        <>
                          <span>&bull;</span>
                          <span className="text-slate-400 font-bold">EXPIRED</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-semibold w-fit px-2 py-0.5 rounded-md ${isExpired ? 'text-slate-500 bg-slate-200' : 'text-orange-600 bg-orange-50'}`}>
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                       {formatInTimeZone(new Date(booking.start_time), HOST_TIMEZONE, 'EEE')},{' '}
                       {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => onBookingEdit(booking)}
                  disabled={cancelingId === booking.id || isExpired}
                  title={isExpired ? "Cannot edit expired bookings" : "Edit this booking"}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleCancel(booking.id, booking.name)}
                  disabled={cancelingId === booking.id || isExpired}
                  title={isExpired ? "Cannot cancel expired bookings" : "Cancel this booking"}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelingId === booking.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
