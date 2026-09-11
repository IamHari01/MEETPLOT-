'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import BookingForm from '@/components/BookingForm';
import TimelineVisualizer from '@/components/TimelineVisualizer';
import BookingsList from '@/components/BookingsList';
import { Booking } from '@/lib/types/booking';
import { Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for realtime subscriptions (Browser-safe)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    // Default to today's date in YYYY-MM-DD format
    return today.toISOString().split('T')[0];
  });
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
      
      // We only care about bookings for the selected date in this view.
      // In a real app with huge data, this filtering would happen on the server.
      // For this implementation, we filter the active bookings by the selected date.
      const filtered = data.bookings.filter((b: Booking) => {
        // Compare the local date portion of the UTC timestamp
        const bDate = new Date(b.start_time).toISOString().split('T')[0];
        return bDate === selectedDate;
      });
      
      setBookings(filtered);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('public:bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Realtime update received:', payload);
          // Refetch bookings to recalculate availability correctly
          fetchBookings();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to Supabase Realtime');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Failed to subscribe to Realtime:', status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  // Construct a base ISO string for the selected date at midnight UTC
  const selectedDateISO = `${selectedDate}T00:00:00.000Z`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar selectedDate={selectedDate} onDateChange={setSelectedDate} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex flex-col">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Form & List */}
          <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col gap-8 shrink-0">
            <BookingForm 
              dateISO={selectedDateISO} 
              bookings={bookings} 
              onBookingCreated={fetchBookings}
            />
            
            <BookingsList 
              bookings={bookings} 
              onBookingCanceled={fetchBookings}
            />
          </div>
          
          {/* Right Column: Timeline Visualizer */}
          <div className="w-full lg:w-7/12 xl:w-2/3 sticky top-24">
            {isLoading ? (
               <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 shadow-sm min-h-[400px]">
                 <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                 <p className="text-sm font-medium">Loading schedule...</p>
               </div>
            ) : error ? (
               <div className="bg-rose-50 border border-rose-200 rounded-2xl p-12 flex flex-col items-center justify-center text-rose-600 shadow-sm min-h-[400px]">
                 <p className="text-sm font-medium">{error}</p>
                 <button onClick={fetchBookings} className="mt-4 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition-colors">
                   Retry
                 </button>
               </div>
            ) : (
              <TimelineVisualizer 
                dateISO={selectedDateISO} 
                bookings={bookings}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
