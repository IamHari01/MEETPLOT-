export type AllowedDuration = 30 | 60 | 90;

export interface Booking {
  id: string;
  name: string;
  start_time: string; // ISO 8601 string
  end_time: string;   // ISO 8601 string
  duration: AllowedDuration;
  created_at: string;
  confirmation_sent_at?: string | null;
  calendar_synced_at?: string | null;
}

export interface CreateBookingInput {
  name: string;
  start_time: string; // ISO 8601 string
  duration: AllowedDuration;
}

export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BUFFER';

export interface TimeSlotInfo {
  time: string; // "09:00", "09:15", etc.
  isoTime: string; // full ISO string for the date/time
  status: SlotStatus;
  bookingName?: string;
  bookingId?: string;
  reason?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
