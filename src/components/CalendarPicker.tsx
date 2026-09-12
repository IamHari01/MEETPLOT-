'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HOST_TIMEZONE } from '@/lib/booking/logic';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isBefore, 
  startOfDay 
} from 'date-fns';

interface CalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD format
  onDateChange: (date: string) => void;
}

export default function CalendarPicker({ selectedDate, onDateChange }: CalendarPickerProps) {
  // Parse the selected date safely in local time to avoid browser timezone shifts
  const [sYear, sMonth, sDay] = selectedDate.split('-');
  const selectedDateObj = new Date(parseInt(sYear), parseInt(sMonth) - 1, parseInt(sDay));

  const [currentMonth, setCurrentMonth] = useState(selectedDateObj);

  // Determine "today" in the Host Timezone (Asia/Kolkata) to disable past dates
  const now = new Date();
  const todayString = new Intl.DateTimeFormat('en-CA', {
    timeZone: HOST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
  
  const [tYear, tMonth, tDay] = todayString.split('-');
  const today = new Date(parseInt(tYear), parseInt(tMonth) - 1, parseInt(tDay));

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const onDateClick = (day: Date) => {
    // Return formatted as YYYY-MM-DD based on local date
    onDateChange(format(day, 'yyyy-MM-dd'));
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-sm font-bold text-slate-800">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'E'; // e.g., 'Mon', 'Tue'
    const days = [];
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    // Parse the selected date safely in local time
    const [sYear, sMonth, sDay] = selectedDate.split('-');
    const selectedDateObj = new Date(parseInt(sYear), parseInt(sMonth) - 1, parseInt(sDay));

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Disable past dates relative to "today" in IST
        const isPast = isBefore(cloneDay, today);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = isSameDay(day, selectedDateObj);
        
        days.push(
          <button
            type="button"
            key={day.toISOString()}
            onClick={() => onDateClick(cloneDay)}
            disabled={isPast}
            className={`
              p-2 w-full flex items-center justify-center text-sm rounded-xl font-medium transition-all
              ${!isCurrentMonth ? 'text-slate-300' : ''}
              ${isPast ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100'}
              ${isSelected && !isPast ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-500/20' : 'text-slate-700'}
            `}
          >
            {formattedDate}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-slate-50/50 border border-slate-200/60 p-4 rounded-2xl">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
