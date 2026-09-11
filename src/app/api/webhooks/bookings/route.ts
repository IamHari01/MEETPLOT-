import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Booking } from '@/lib/types/booking';

// We must use the SERVICE_ROLE_KEY to bypass RLS and update the internal tracking columns
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'dev-secret-123'; // In production, require a real secret

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Authorization (Idempotency and Security)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabase) {
      console.warn('Webhook received but Supabase client is not configured with service role key.');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // 2. Parse Webhook Payload
    const body = await req.json();
    if (body.type !== 'INSERT' || body.table !== 'bookings' || !body.record?.id) {
      return NextResponse.json({ message: 'Ignored: not a booking insert event' }, { status: 200 });
    }

    const bookingId = body.record.id;

    // 3. Fetch current booking state to ensure idempotency (prevent duplicate processing)
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      console.error(`Failed to fetch booking ${bookingId}:`, fetchError);
      // Return 200 instead of 500 to prevent Supabase from retrying infinitely for a deleted/missing row
      return NextResponse.json({ message: 'Booking not found' }, { status: 200 });
    }

    const updates: Partial<Booking> = {};
    let processedAny = false;

    // 4. Process Events Idempotently
    if (!booking.confirmation_sent_at) {
      console.log(`[Worker] Processing Confirmation Email for booking: ${bookingId}`);
      // Simulate Email Sending Delay
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`[Worker] -> Confirmation Email Sent to ${booking.name}!`);
      updates.confirmation_sent_at = new Date().toISOString();
      processedAny = true;
    }

    if (!booking.calendar_synced_at) {
      console.log(`[Worker] Processing Google Calendar Sync for booking: ${bookingId}`);
      // Simulate API call Delay
      await new Promise(resolve => setTimeout(resolve, 600));
      console.log(`[Worker] -> Google Calendar Synced!`);
      updates.calendar_synced_at = new Date().toISOString();
      processedAny = true;
    }

    // 5. Commit Tracking State back to Database
    if (processedAny) {
      const { error: updateError } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId);

      if (updateError) {
        console.error(`[Worker] Failed to update idempotency flags for ${bookingId}:`, updateError);
        // Returning 500 here *would* trigger a webhook retry, which is safe because our logic is idempotent!
        return NextResponse.json({ error: 'Failed to update tracking flags' }, { status: 500 });
      }
    } else {
      console.log(`[Worker] Events for booking ${bookingId} already processed. Skipping.`);
    }

    return NextResponse.json({ success: true, processed: processedAny });

  } catch (error: any) {
    console.error('[Worker] Unexpected error processing webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
