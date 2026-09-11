import { AllowedDuration, Booking, CreateBookingInput, SlotStatus, TimeSlotInfo, ValidationResult } from '../types/booking';
import { toDate, formatInTimeZone } from 'date-fns-tz';

export const HOST_TIMEZONE = 'America/New_York';
export const WORK_START_HOUR = 9;  // 9:00 AM
export const WORK_END_HOUR = 18;   // 6:00 PM
export const BUFFER_MINUTES = 15;
export const ALLOWED_DURATIONS: AllowedDuration[] = [30, 60, 90];

/**
 * Validates name input
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Please enter your name.' };
  }
  return { isValid: true };
}

/**
 * Validates booking duration
 */
export function validateDuration(duration: number): ValidationResult {
  if (!ALLOWED_DURATIONS.includes(duration as AllowedDuration)) {
    return { isValid: false, error: 'This duration is not available.' };
  }
  return { isValid: true };
}

/**
 * Calculates end time ISO string given start time ISO string and duration in minutes
 */
export function calculateEndTime(startTimeISO: string, durationMinutes: number): string {
  const start = new Date(startTimeISO);
  if (isNaN(start.getTime())) {
    throw new Error('Invalid start time format');
  }
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return end.toISOString();
}

/**
 * Verifies that a meeting starts no earlier than 9:00 AM and ends no later than 6:00 PM.
 * Ensures this condition holds true strictly within the HOST_TIMEZONE.
 */
export function validateWorkingHours(startTimeISO: string, endTimeISO: string): ValidationResult {
  const start = new Date(startTimeISO);
  const end = new Date(endTimeISO);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid time provided.' };
  }

  // Use the date part of the start time (YYYY-MM-DD) to construct the host's boundaries for that specific day
  const dateStr = startTimeISO.split('T')[0];
  
  const workStartString = `${dateStr}T${String(WORK_START_HOUR).padStart(2, '0')}:00:00`;
  const workEndString = `${dateStr}T${String(WORK_END_HOUR).padStart(2, '0')}:00:00`;

  // toDate parses the local string AS IF it were in the target timezone, giving us precise UTC bounds
  const workStart = toDate(workStartString, { timeZone: HOST_TIMEZONE });
  const workEnd = toDate(workEndString, { timeZone: HOST_TIMEZONE });

  if (start.getTime() < workStart.getTime()) {
    return { isValid: false, error: `Meeting must be scheduled between 9:00 AM and 6:00 PM (${HOST_TIMEZONE}).` };
  }

  if (end.getTime() > workEnd.getTime()) {
    return { isValid: false, error: `Meeting must end by 6:00 PM (${HOST_TIMEZONE}).` };
  }

  return { isValid: true };
}

/**
 * Central Buffer & Overlap Verification Algorithm
 * Enforces mandatory 15-minute buffer between meetings.
 * Conflict condition: newStart < (existingEnd + 15m) AND (newEnd + 15m) > existingStart
 */
export function validateBufferAndOverlap(
  newStartISO: string,
  newEndISO: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): ValidationResult {
  const newStartMs = new Date(newStartISO).getTime();
  const newEndMs = new Date(newEndISO).getTime();
  const bufferMs = BUFFER_MINUTES * 60 * 1000;

  for (const existing of existingBookings) {
    if (excludeBookingId && existing.id === excludeBookingId) continue;

    const existingStartMs = new Date(existing.start_time).getTime();
    const existingEndMs = new Date(existing.end_time).getTime();

    // Check if new booking overlaps with existing booking or its 15-min buffers
    const isConflict =
      newStartMs < (existingEndMs + bufferMs) &&
      (newEndMs + bufferMs) > existingStartMs;

    if (isConflict) {
      if (newStartMs >= existingEndMs && newStartMs < existingEndMs + bufferMs) {
        return {
          isValid: false,
          error: 'Please leave a 15-minute buffer after the previous meeting.',
        };
      } else if (newEndMs > existingStartMs - bufferMs && newEndMs <= existingStartMs) {
        return {
          isValid: false,
          error: 'Please leave a 15-minute buffer before the next meeting.',
        };
      } else {
        return {
          isValid: false,
          error: 'This time conflicts with an existing booking.',
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Main Central Booking Validation function.
 * Evaluates name, duration, working hours, and 15-minute buffer constraints.
 */
export function validateBookingRequest(
  input: CreateBookingInput,
  existingBookings: Booking[]
): ValidationResult {
  const nameVal = validateName(input.name);
  if (!nameVal.isValid) return nameVal;

  const durationVal = validateDuration(input.duration);
  if (!durationVal.isValid) return durationVal;

  let endTimeISO: string;
  try {
    endTimeISO = calculateEndTime(input.start_time, input.duration);
  } catch {
    return { isValid: false, error: 'Invalid start time.' };
  }

  const hoursVal = validateWorkingHours(input.start_time, endTimeISO);
  if (!hoursVal.isValid) return hoursVal;

  const bufferVal = validateBufferAndOverlap(input.start_time, endTimeISO, existingBookings);
  if (!bufferVal.isValid) return bufferVal;

  return { isValid: true };
}

/**
 * Generates 15-minute time slots from 9:00 AM to 6:00 PM (Host Time) for visual rendering
 * and formats the display labels in the userTimezone.
 */
export function generateTimelineSlots(dateISO: string, bookings: Booking[], userTimezone: string): TimeSlotInfo[] {
  const slots: TimeSlotInfo[] = [];
  
  const dateStr = dateISO.split('T')[0];
  const workStartString = `${dateStr}T${String(WORK_START_HOUR).padStart(2, '0')}:00:00`;
  const workEndString = `${dateStr}T${String(WORK_END_HOUR).padStart(2, '0')}:00:00`;

  const startTimeMs = toDate(workStartString, { timeZone: HOST_TIMEZONE }).getTime();
  const endTimeMs = toDate(workEndString, { timeZone: HOST_TIMEZONE }).getTime();

  const bufferMs = BUFFER_MINUTES * 60 * 1000;

  for (let currentMs = startTimeMs; currentMs < endTimeMs; currentMs += 15 * 60 * 1000) {
    const slotStartMs = currentMs;
    const slotEndMs = slotStartMs + 15 * 60 * 1000;

    // Format the time strictly into the user's selected timezone
    const formattedLabel = formatInTimeZone(new Date(slotStartMs), userTimezone, 'h:mm a');

    let status: SlotStatus = 'AVAILABLE';
    let bookingName: string | undefined;
    let bookingId: string | undefined;
    let reason: string | undefined;

    for (const b of bookings) {
      const bStartMs = new Date(b.start_time).getTime();
      const bEndMs = new Date(b.end_time).getTime();

      if (slotStartMs >= bStartMs && slotStartMs < bEndMs) {
        status = 'BOOKED';
        bookingName = b.name;
        bookingId = b.id;
        reason = `Booked by ${b.name}`;
        break;
      }

      if (
        (slotStartMs >= bEndMs && slotStartMs < bEndMs + bufferMs) ||
        (slotEndMs > bStartMs - bufferMs && slotEndMs <= bStartMs)
      ) {
        status = 'BUFFER';
        bookingName = b.name;
        reason = `15-min buffer around ${b.name}'s meeting`;
      }
    }

    slots.push({
      time: formattedLabel,
      isoTime: new Date(slotStartMs).toISOString(),
      status,
      bookingName,
      bookingId,
      reason,
    });
  }

  return slots;
}

/**
 * Returns available start times formatted in the userTimezone for a requested duration
 */
export function getAvailableStartTimes(
  dateISO: string,
  durationMinutes: AllowedDuration,
  bookings: Booking[],
  userTimezone: string
): { timeLabel: string; isoTime: string }[] {
  const availableTimes: { timeLabel: string; isoTime: string }[] = [];
  
  const dateStr = dateISO.split('T')[0];
  const workStartString = `${dateStr}T${String(WORK_START_HOUR).padStart(2, '0')}:00:00`;
  const workEndString = `${dateStr}T${String(WORK_END_HOUR).padStart(2, '0')}:00:00`;

  const startTimeMs = toDate(workStartString, { timeZone: HOST_TIMEZONE }).getTime();
  const endTimeMs = toDate(workEndString, { timeZone: HOST_TIMEZONE }).getTime();

  for (
    let currentMs = startTimeMs;
    currentMs + durationMinutes * 60 * 1000 <= endTimeMs;
    currentMs += 15 * 60 * 1000
  ) {
    const startISO = new Date(currentMs).toISOString();
    const endISO = calculateEndTime(startISO, durationMinutes);

    const val = validateBufferAndOverlap(startISO, endISO, bookings);
    if (val.isValid) {
      const formattedLabel = formatInTimeZone(new Date(currentMs), userTimezone, 'h:mm a');

      availableTimes.push({
        timeLabel: formattedLabel,
        isoTime: startISO,
      });
    }
  }

  return availableTimes;
}
