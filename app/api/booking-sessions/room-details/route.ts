import { NextRequest, NextResponse } from "next/server";
import { areStayDatesValid } from "@/app/lib/utils/date";
import { BookingErrors } from "@/app/constants/booking-errors";
import { buildRoomDetailsUrl, buildSearchUrl } from "@/app/constants/routes";
import { createBookingSessionDotNet } from "@/lib/api/dotnet-booking-client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const roomId = Number(searchParams.get("roomId"));
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");
  const guestCount = searchParams.get("guestCount");
  const parsedGuestCount = Number(guestCount);

  const searchRedirect = (bookingError?: string) =>
    NextResponse.redirect(
      new URL(
        buildSearchUrl({
          checkInDate: checkInDate ?? undefined,
          checkOutDate: checkOutDate ?? undefined,
          guestCount: guestCount ?? undefined,
          bookingError: bookingError ?? BookingErrors.InvalidSelection,
          unavailableRoomId:
            Number.isInteger(roomId) && roomId > 0 ? roomId : undefined,
        }),
        request.url
      )
    );

  if (
    !Number.isInteger(roomId) ||
    roomId <= 0 ||
    !checkInDate ||
    !checkOutDate ||
    !guestCount ||
    !Number.isInteger(parsedGuestCount) ||
    parsedGuestCount < 1 ||
    !areStayDatesValid(checkInDate, checkOutDate)
  ) {
    return searchRedirect(BookingErrors.InvalidSelection);
  }

  let response: Response;
  let envelope: Awaited<ReturnType<typeof createBookingSessionDotNet>>["envelope"];

  try {
    const result = await createBookingSessionDotNet({
      roomId,
      checkInDate,
      checkOutDate,
      guestCount: parsedGuestCount,
    });
    response = result.response;
    envelope = result.envelope;
  } catch {
    return searchRedirect(BookingErrors.InvalidSelection);
  }

  if (!response.ok || !envelope.success || !envelope.data?.token) {
    const bookingError =
      response.status === 409
        ? BookingErrors.RoomUnavailable
        : BookingErrors.InvalidSelection;

    return searchRedirect(bookingError);
  }

  return NextResponse.redirect(
    new URL(buildRoomDetailsUrl(roomId, envelope.data.token), request.url)
  );
}
