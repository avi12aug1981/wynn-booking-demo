import { NextRequest, NextResponse } from "next/server";
import { createBookingSession } from "@/features/booking/services/booking-session-service";


function buildSearchUrl(
  checkInDate?: string | null,
  checkOutDate?: string | null,
  guestCount?: string | null,
  bookingError?: string,  
  unavailableRoomId?: number
) {
  const params = new URLSearchParams();

  if (checkInDate) params.set("checkInDate", checkInDate);
  if (checkOutDate) params.set("checkOutDate", checkOutDate);
  if (guestCount) params.set("guestCount", guestCount);
  if (bookingError) params.set("bookingError", bookingError);
  if (unavailableRoomId) {
    params.set("unavailableRoomId", String(unavailableRoomId));
  }

  const query = params.toString();

  return query ? `/?${query}` : "/";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const roomId = Number(searchParams.get("roomId"));
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");
  const guestCount = searchParams.get("guestCount");

  if (!checkInDate || !checkOutDate || !guestCount) {
    return NextResponse.redirect(
      new URL(buildSearchUrl(checkInDate, checkOutDate, guestCount, "invalid-selection"), request.url)
    );
  }

  const result = await createBookingSession({
    roomId,
    checkInDate,
    checkOutDate,
    guestCount: Number(guestCount),
  });

  if (!result.success) {
    const errorCode = result.code === "room-booked" ? "room-unavailable" : "invalid-selection";

    return NextResponse.redirect(
      new URL(
        buildSearchUrl(
          checkInDate,
          checkOutDate,
          guestCount,
          errorCode,
          Number.isInteger(roomId) && roomId > 0 ? roomId : undefined
        ),
        request.url
      )
    );
  }

  return NextResponse.redirect(new URL(result.redirectUrl, request.url));
}
