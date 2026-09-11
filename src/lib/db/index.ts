import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking, CreateBookingInput } from '../types/booking';
import { validateBookingRequest } from '../booking/logic';
import fs from 'fs';
import path from 'path';

// Mutex for atomic local execution to prevent race conditions during local concurrent requests
class Mutex {
  private queue: (() => void)[] = [];
  private locked = false;

  async lock(): Promise<() => void> {
    return new Promise((resolve) => {
      const release = () => {
        if (this.queue.length > 0) {
          const next = this.queue.shift();
          if (next) next();
        } else {
          this.locked = false;
        }
      };

      if (this.locked) {
        this.queue.push(resolve.bind(null, release));
      } else {
        this.locked = true;
        resolve(release);
      }
    });
  }
}

const localMutex = new Mutex();

// Environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Path for local dev file storage fallback
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'bookings.json');

function ensureLocalStoreExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readLocalBookings(): Booking[] {
  ensureLocalStoreExists();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Booking[];
  } catch {
    return [];
  }
}

function writeLocalBookings(bookings: Booking[]) {
  ensureLocalStoreExists();
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
}

/**
 * Retrieves all bookings sorted chronologically by start_time
 */
export async function getBookings(): Promise<Booking[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Supabase fetch error, falling back to local store:', error);
    } else if (data) {
      return data as Booking[];
    }
  }

  // Local storage fallback
  const release = await localMutex.lock();
  try {
    const bookings = readLocalBookings();
    return bookings.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  } finally {
    release();
  }
}

/**
 * Creates a booking atomically.
 * Server-side validation and concurrency lock are applied.
 */
export async function createBooking(input: CreateBookingInput): Promise<{ booking?: Booking; error?: string }> {
  // 1. If Supabase is connected, call RPC stored procedure `create_booking_atomic`
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('create_booking_atomic', {
        p_name: input.name,
        p_start_time: input.start_time,
        p_duration: input.duration,
      });

      if (error) {
        return { error: error.message };
      }
      return { booking: data as Booking };
    } catch (e: any) {
      console.error('Supabase RPC error:', e);
      // fallback to local handling if DB error
    }
  }

  // 2. Local database / filesystem fallback with Mutex for concurrency safety
  const release = await localMutex.lock();
  try {
    const existingBookings = readLocalBookings();

    // Perform central domain validation
    const validation = validateBookingRequest(input, existingBookings);
    if (!validation.isValid) {
      return { error: validation.error || 'Invalid booking request.' };
    }

    const startTimeDate = new Date(input.start_time);
    const endTimeDate = new Date(startTimeDate.getTime() + input.duration * 60 * 1000);

    const newBooking: Booking = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: input.name.trim(),
      start_time: startTimeDate.toISOString(),
      end_time: endTimeDate.toISOString(),
      duration: input.duration,
      created_at: new Date().toISOString(),
    };

    existingBookings.push(newBooking);
    writeLocalBookings(existingBookings);

    return { booking: newBooking };
  } finally {
    release();
  }
}

/**
 * Cancels an existing booking by ID and restores slot availability.
 */
export async function cancelBooking(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  // Local storage fallback
  const release = await localMutex.lock();
  try {
    const bookings = readLocalBookings();
    const updated = bookings.filter((b) => b.id !== id);

    if (bookings.length === updated.length) {
      return { success: false, error: 'Booking not found.' };
    }

    writeLocalBookings(updated);
    return { success: true };
  } finally {
    release();
  }
}
