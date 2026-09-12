import { NextRequest, NextResponse } from 'next/server';
import { getBookings, createBooking } from '@/lib/db';
import { CreateBookingInput } from '@/lib/types/booking';

export const dynamic = 'force-dynamic';

/**
 * GET /api/bookings
 * Returns all active bookings ordered chronologically
 */
export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json({ success: true, bookings }, { status: 200 });
  } catch (error: any) {
    console.error('[API] GET /api/bookings error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while fetching bookings.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings
 * Validates & creates a new booking atomically
 */
export async function POST(req: NextRequest) {
  try {
    const body: CreateBookingInput = await req.json();

    // Enforce basic request shape
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const result = await createBooking(body);

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, booking: result.booking },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API] POST /api/bookings error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected internal server error occurred.' },
      { status: 500 }
    );
  }
}
