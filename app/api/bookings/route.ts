import { NextRequest, NextResponse } from "next/server";
import { Messages } from "@/app/constants/messages";
import { createBooking } from "@/app/lib/services/booking-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await createBooking(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        {
          status: result.status,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      {
        status: result.status,
      }
    );
  } catch (error) {
    console.error(Messages.Common.CreateBookingFailed, error);

    return NextResponse.json(
      {
        success: false,
        message: Messages.Common.UnexpectedError,
      },
      {
        status: 500,
      }
    );
  }
}