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
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-800" />
            <span>Schedule Visualizer (IST)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time status derived from single source of truth</p>
        </div>

        {/* Status Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Available ({availableCount})
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-400 text-slate-900 border border-transparent rounded-full">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            Booked ({bookedCount})
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            Buffer ({bufferCount})
          </span>
        </div>
      </div>

      {/* Grid of 15-Minute Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
        {mergedSlots.map((slot) => {
          let statusStyle = '';
          let badgeText = 'Available';
          let icon = <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;

          if (slot.status === 'BOOKED') {
            statusStyle = 'bg-orange-400 text-slate-900 shadow-sm border-transparent';
            badgeText = `${slot.bookingName} (${slot.span * 15} mins)`;
            icon = <UserCheck className="w-3.5 h-3.5 text-slate-900 shrink-0" />;
          } else if (slot.status === 'BUFFER') {
            statusStyle = 'bg-amber-100 border-amber-300 text-amber-900';
            badgeText = 'Buffer (15m)';
            icon = <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
          } else {
            statusStyle = 'bg-emerald-100 border-emerald-300 hover:border-emerald-400 hover:bg-emerald-200 text-emerald-900';
          }

          return (
            <div
              key={slot.isoTime}
              title={slot.reason || `${slot.time} - ${slot.status}`}
              className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between h-20 ${statusStyle} ${getSpanClass(slot.span)}`}
            >
              <div className="font-bold flex items-center justify-between text-inherit">
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
