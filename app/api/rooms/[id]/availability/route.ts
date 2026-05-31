import { NextRequest, NextResponse } from "next/server";
import { checkRoomAvailability } from "@/app/lib/availability";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const roomId = Number(id);
  const checkInValue = request.nextUrl.searchParams.get("checkInDate");
  const checkOutValue = request.nextUrl.searchParams.get("checkOutDate");

  if (!Number.isInteger(roomId) || roomId <= 0) {
    return NextResponse.json(
      { available: false, reason: "unavailable", message: "Invalid room." },
      { status: 400 }
    );
  }

  if (!checkInValue || !checkOutValue) {
    return NextResponse.json(
      { available: false, reason: "unavailable", message: "Dates are required." },
      { status: 400 }
    );
  }

  const availability = await checkRoomAvailability(roomId, checkInValue, checkOutValue);

  return NextResponse.json(availability);
}
