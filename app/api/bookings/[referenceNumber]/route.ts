import { NextRequest, NextResponse } from "next/server";
import { Messages } from "@/app/constants/messages";
import { getBookingByReferenceNumber } from "@/features/booking/services/booking-service";

type RouteParams = {
  params: Promise<{
    referenceNumber: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteParams) {
  try {
    const { referenceNumber } = await context.params;

    const result = await getBookingByReferenceNumber(referenceNumber);

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
    console.error(Messages.Common.BookingLookupFailed, error);

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