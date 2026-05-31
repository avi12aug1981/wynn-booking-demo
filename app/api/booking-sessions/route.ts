import { NextRequest, NextResponse } from "next/server";
import { Messages } from "@/app/constants/messages";
import { calculateNumberOfNights } from "@/app/lib/availability";
import { createBookingSession } from "@/app/lib/services/booking-session-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await createBookingSession({
      roomId: Number(body.roomId),
      checkInDate: String(body.checkInDate),
      checkOutDate: String(body.checkOutDate),
      guestCount: Number(body.guestCount),
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          token: result.token,
          redirectUrl: result.redirectUrl,
          numberOfNights: calculateNumberOfNights(
            new Date(String(body.checkInDate)),
            new Date(String(body.checkOutDate))
          ),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking session failed", error);

    return NextResponse.json(
      { success: false, message: Messages.Common.UnexpectedError },
      { status: 500 }
    );
  }
}
