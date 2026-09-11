import { describe, it, expect } from 'vitest';
import {
  validateBookingRequest,
  validateWorkingHours,
  validateDuration,
  validateName,
  calculateEndTime,
  validateBufferAndOverlap,
  getAvailableStartTimes,
  generateTimelineSlots,
} from '../src/lib/booking/logic';
import { Booking } from '../src/lib/types/booking';

describe('Booking Business Rules & Validation Engine', () => {
  const TEST_DATE = '2026-09-15'; // Base date for testing

  const createIso = (hours: number, minutes: number): string => {
    const { toDate } = require('date-fns-tz');
    const dateStr = `${TEST_DATE}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    return toDate(dateStr, { timeZone: 'Asia/Kolkata' }).toISOString();
  };

  describe('Name Validation', () => {
    it('rejects empty name', () => {
      expect(validateName('').isValid).toBe(false);
      expect(validateName('   ').isValid).toBe(false);
    });

    it('accepts valid name', () => {
      expect(validateName('Alice Smith').isValid).toBe(true);
    });
  });

  describe('Duration Validation', () => {
    it('accepts allowed durations: 30, 60, 90 minutes', () => {
      expect(validateDuration(30).isValid).toBe(true);
      expect(validateDuration(60).isValid).toBe(true);
      expect(validateDuration(90).isValid).toBe(true);
    });

    it('rejects invalid durations like 15, 45, 120 minutes', () => {
      expect(validateDuration(15).isValid).toBe(false);
      expect(validateDuration(45).isValid).toBe(false);
      expect(validateDuration(120).isValid).toBe(false);
    });
  });

  describe('Working Hours Enforcement (9:00 AM - 6:00 PM)', () => {
    it('allows booking starting at exactly 9:00 AM', () => {
      const start = createIso(9, 0);
      const end = createIso(10, 0);
      expect(validateWorkingHours(start, end).isValid).toBe(true);
    });

    it('allows booking ending at exactly 6:00 PM', () => {
      const start = createIso(16, 30); // 4:30 PM
      const end = createIso(18, 0);    // 6:00 PM (90 mins)
      expect(validateWorkingHours(start, end).isValid).toBe(true);
    });

    it('rejects booking starting before 9:00 AM', () => {
      const start = createIso(8, 45); // 8:45 AM
      const end = createIso(9, 15);
      const res = validateWorkingHours(start, end);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('between 9:00 AM and 6:00 PM');
    });

    it('rejects booking ending after 6:00 PM', () => {
      const start = createIso(17, 30); // 5:30 PM
      const end = createIso(18, 30);   // 6:30 PM (60 mins)
      const res = validateWorkingHours(start, end);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('by 6:00 PM');
    });
  });

  describe('Mandatory 15-Minute Buffer & Overlap Rules', () => {
    // Existing booking: 10:00 AM to 11:00 AM
    const existingBookings: Booking[] = [
      {
        id: 'booking-1',
        name: 'John Doe',
        start_time: createIso(10, 0),
        end_time: createIso(11, 0),
        duration: 60,
        created_at: new Date().toISOString(),
      },
    ];

    it('rejects duplicate/exact double booking at same start time (10:00 AM)', () => {
      const start = createIso(10, 0);
      const end = createIso(11, 0);
      const res = validateBufferAndOverlap(start, end, existingBookings);
      expect(res.isValid).toBe(false);
    });

    it('rejects partial overlap (10:30 AM to 11:30 AM)', () => {
      const start = createIso(10, 30);
      const end = createIso(11, 30);
      const res = validateBufferAndOverlap(start, end, existingBookings);
      expect(res.isValid).toBe(false);
    });

    it('rejects 0-minute gap after existing meeting (11:00 AM start)', () => {
      const start = createIso(11, 0);
      const end = createIso(12, 0);
      const res = validateBufferAndOverlap(start, end, existingBookings);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('15-minute buffer after');
    });

    it('rejects 5-minute gap after existing meeting (11:05 AM start)', () => {
      const start = createIso(11, 5);
      const end = createIso(12, 5);
      const res = validateBufferAndOverlap(start, end, existingBookings);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('15-minute buffer after');
    });

    it('rejects 10-minute gap after existing meeting (11:10 AM start)', () => {
      const start = createIso(11, 10);
      const end = createIso(12, 10);
      const res = validateBufferAndOverlap(start, end, existingBookings);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('15-minute buffer after');
    });

    it('ACCEPTs exact 15-minute gap after existing meeting (11:15 AM start)', () => {
      const start = createIso(11, 15);
      const end = createIso(12, 15);
      const res = validateBufferAndOverlap(start, end, existingBookings);
      expect(res.isValid).toBe(true);
    });

    it('rejects booking ending with less than 15-min buffer before existing meeting (09:00 AM - 09:50 AM)', () => {
      const start = createIso(9, 0);
      const end = createIso(9, 50); // only 10 mins buffer before 10:00 AM
      const res = validateBufferAndOverlap(start, end, existingBookings);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('15-minute buffer before');
    });

    it('ACCEPTs booking ending with exact 15-min buffer before existing meeting (09:00 AM - 09:45 AM)', () => {
      const start = createIso(9, 0);
      const end = createIso(9, 45); // 15 mins buffer before 10:00 AM (09:45 -> 10:00)
      const res = validateBufferAndOverlap(start, end, existingBookings);
      expect(res.isValid).toBe(true);
    });
  });

  describe('Full Request Integration & Cancellation Behavior', () => {
    it('processes complete valid booking request', () => {
      const res = validateBookingRequest(
        {
          name: 'Sarah Connor',
          start_time: createIso(9, 0),
          duration: 30,
        },
        []
      );
      expect(res.isValid).toBe(true);
    });

    it('restores availability after booking cancellation', () => {
      let activeBookings: Booking[] = [
        {
          id: 'b-100',
          name: 'Bob',
          start_time: createIso(10, 0),
          end_time: createIso(11, 0),
          duration: 60,
          created_at: new Date().toISOString(),
        },
      ];

      // Before cancellation, 10:30 booking fails
      const checkBefore = validateBookingRequest(
        { name: 'Alice', start_time: createIso(10, 30), duration: 30 },
        activeBookings
      );
      expect(checkBefore.isValid).toBe(false);

      // Simulate cancellation (remove b-100)
      activeBookings = [];

      // After cancellation, 10:30 booking succeeds
      const checkAfter = validateBookingRequest(
        { name: 'Alice', start_time: createIso(10, 30), duration: 30 },
        activeBookings
      );
      expect(checkAfter.isValid).toBe(true);
    });
  });

  describe('Timeline & Available Start Times Generator', () => {
    it('generates 15-minute timeline slots from 9:00 AM to 6:00 PM', () => {
      const slots = generateTimelineSlots(createIso(9, 0), []);
      // 9:00 AM to 6:00 PM is 9 hours = 36 slots of 15 mins
      expect(slots.length).toBe(36);
      expect(slots[0].time).toMatch(/9:00/);
      expect(slots[slots.length - 1].time).toMatch(/5:45/);
    });

    it('marks slot as BOOKED during meeting and BUFFER in 15-min margin', () => {
      const bookings: Booking[] = [
        {
          id: 'b-1',
          name: 'Eve',
          start_time: createIso(10, 0), // 10:00
          end_time: createIso(11, 0),   // 11:00
          duration: 60,
          created_at: new Date().toISOString(),
        },
      ];

      const slots = generateTimelineSlots(createIso(9, 0), bookings);

      // 10:00 slot -> BOOKED
      const slot1000 = slots.find((s) => s.isoTime === createIso(10, 0));
      expect(slot1000?.status).toBe('BOOKED');
      expect(slot1000?.bookingName).toBe('Eve');

      // 11:00 slot -> BUFFER (15 mins after meeting)
      const slot1100 = slots.find((s) => s.isoTime === createIso(11, 0));
      expect(slot1100?.status).toBe('BUFFER');

      // 11:15 slot -> AVAILABLE
      const slot1115 = slots.find((s) => s.isoTime === createIso(11, 15));
      expect(slot1115?.status).toBe('AVAILABLE');
    });

    it('returns list of available start times for chosen duration', () => {
      const bookings: Booking[] = [
        {
          id: 'b-1',
          name: 'Dave',
          start_time: createIso(10, 0),
          end_time: createIso(11, 0),
          duration: 60,
          created_at: new Date().toISOString(),
        },
      ];

      const avail60 = getAvailableStartTimes(createIso(9, 0), 60, bookings);
      const isoTimes = avail60.map((a) => a.isoTime);

      // 9:00 AM (ends 10:00 AM) -> violates buffer (only 0 min gap) -> NOT available!
      expect(isoTimes).not.toContain(createIso(9, 0));

      // 8:45 AM would end 9:45 AM (15m buffer), but starts before 9:00 AM -> NOT available
      // 11:15 AM (ends 12:15 PM) -> 15 min buffer after 11:00 AM -> AVAILABLE!
      expect(isoTimes).toContain(createIso(11, 15));
    });
  });
});
