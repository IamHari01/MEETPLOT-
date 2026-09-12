import { NextRequest, NextResponse } from 'next/server';
import { cancelBooking } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/bookings/[id]
 * Cancels a booking and restores slot availability
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const result = await cancelBooking(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to cancel booking' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Booking canceled successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`[API] DELETE /api/bookings/[id] error for id ${params?.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while canceling the booking.' },
      { status: 500 }
    );
  }
}
