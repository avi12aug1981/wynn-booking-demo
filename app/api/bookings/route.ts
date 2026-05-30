import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/app/lib/services/booking-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createBooking(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Create booking API failed", error);

    return NextResponse.json(
      { message: "Unable to complete booking. Please try again." },
      { status: 500 }
    );
  }
}