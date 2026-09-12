-- Production Database Schema for Supabase / PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL CHECK (duration IN (30, 60, 90)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Index for fast chronological queries
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings (start_time ASC);

-- 2. Concurrency-Safe Stored Procedure for Booking Creation
-- Enforces 15-minute mandatory buffer between meetings atomically
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_name TEXT,
  p_start_time TIMESTAMPTZ,
  p_duration INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_end_time TIMESTAMPTZ;
  v_conflict_count INTEGER;
  v_new_id UUID;
  v_result JSONB;
BEGIN
  -- Trim name and validate
  IF char_length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'Name cannot be empty';
  END IF;

  IF p_duration NOT IN (30, 60, 90) THEN
    RAISE EXCEPTION 'Invalid duration. Must be 30, 60, or 90 minutes.';
  END IF;

  v_end_time := p_start_time + (p_duration || ' minutes')::INTERVAL;

  -- Acquire explicit advisory lock based on date to prevent race conditions during concurrent bookings
  PERFORM pg_advisory_xact_lock(hashtext(to_char(p_start_time, 'YYYY-MM-DD')));

  -- Check for overlap enforcing 15-minute buffer:
  -- Conflict if: (new_start < existing_end + 15 mins) AND (new_end + 15 mins > existing_start)
  SELECT COUNT(*) INTO v_conflict_count
  FROM bookings
  WHERE p_start_time < (end_time + INTERVAL '15 minutes')
    AND (v_end_time + INTERVAL '15 minutes') > start_time;

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'Conflict: slot overlaps with existing booking or mandatory 15-minute buffer.';
  END IF;

  INSERT INTO bookings (name, start_time, end_time, duration)
  VALUES (trim(p_name), p_start_time, v_end_time, p_duration)
  RETURNING jsonb_build_object(
    'id', id,
    'name', name,
    'start_time', start_time,
    'end_time', end_time,
    'duration', duration,
    'created_at', created_at
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 3. Custom App Users Table (Vercel-compatible Auth)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
