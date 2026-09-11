'use client';

import React from 'react';
import { Booking, SlotStatus, TimeSlotInfo } from '@/lib/types/booking';
import { generateTimelineSlots } from '@/lib/booking/logic';
import { Clock, ShieldAlert, CheckCircle, UserCheck } from 'lucide-react';

interface TimelineVisualizerProps {
  dateISO: string;
  bookings: Booking[];
}

export default function TimelineVisualizer({ dateISO, bookings }: TimelineVisualizerProps) {
  const slots: TimeSlotInfo[] = generateTimelineSlots(dateISO, bookings);

  const bookedCount = slots.filter((s) => s.status === 'BOOKED').length;
  const bufferCount = slots.filter((s) => s.status === 'BUFFER').length;
  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;

  // Group consecutive booked slots of the same booking into a single element
  const mergedSlots: (TimeSlotInfo & { span: number })[] = [];
  for (const slot of slots) {
    if (slot.status === 'BOOKED') {
      const last = mergedSlots[mergedSlots.length - 1];
      if (last && last.status === 'BOOKED' && last.bookingId === slot.bookingId) {
        last.span += 1;
        continue;
      }
    }
    mergedSlots.push({ ...slot, span: 1 });
  }

  const getSpanClass = (span: number) => {
    if (span >= 6) return 'col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-6';
    if (span >= 4) return 'col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-4';
    if (span >= 2) return 'col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2';
    return 'col-span-1';
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Schedule Visualizer (IST)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time status derived from single source of truth</p>
        </div>

        {/* Status Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Available ({availableCount})
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Booked ({bookedCount})
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Buffer ({bufferCount})
          </span>
        </div>
      </div>

      {/* Grid of 15-Minute Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
        {mergedSlots.map((slot) => {
          let statusStyle = '';
          let badgeText = 'Available';
          let icon = <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;

          if (slot.status === 'BOOKED') {
            statusStyle = 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm';
            badgeText = `${slot.bookingName} (${slot.span * 15} mins)`;
            icon = <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
          } else if (slot.status === 'BUFFER') {
            statusStyle = 'bg-amber-50/80 border-amber-200 text-amber-900';
            badgeText = 'Buffer (15m)';
            icon = <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
          } else {
            statusStyle = 'bg-slate-50 border-slate-200/80 hover:bg-emerald-50/50 hover:border-emerald-200 text-slate-700';
          }

          return (
            <div
              key={slot.isoTime}
              title={slot.reason || `${slot.time} - ${slot.status}`}
              className={`p-2.5 rounded-xl border text-xs transition-all flex flex-col justify-between h-20 ${statusStyle} ${getSpanClass(slot.span)}`}
            >
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>{slot.time}</span>
                {icon}
              </div>
              <div className="truncate text-[11px] font-medium opacity-90 mt-1">
                {badgeText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
