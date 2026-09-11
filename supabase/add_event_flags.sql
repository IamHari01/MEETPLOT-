-- Add idempotency tracking flags for background worker processing
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS calendar_synced_at TIMESTAMPTZ;

-- Instructions for Webhook Setup:
-- 1. Go to Database -> Webhooks in Supabase Dashboard
-- 2. Create a new Webhook on the 'bookings' table
-- 3. Events: INSERT
-- 4. HTTP Request: POST to your production URL (e.g. https://your-domain.com/api/webhooks/bookings)
-- 5. Add an HTTP Header: `Authorization: Bearer YOUR_WEBHOOK_SECRET`
