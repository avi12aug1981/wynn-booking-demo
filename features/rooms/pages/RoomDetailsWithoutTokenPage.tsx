import { redirect } from "next/navigation";
import { BookingErrors } from "@/app/constants/booking-errors";
import { buildSearchUrl } from "@/app/constants/routes";
import type { PageRouteContext } from "@/features/app-router/route-types";

/**
 * Rejects /rooms/:id (with or without query string). Stay dates and guests
 * live on the booking session token URL (/rooms/:id/:token), not the query.
 */
export default function RoomDetailsWithoutTokenPage(
  _context: PageRouteContext
): never {
  redirect(
    buildSearchUrl({
      bookingError: BookingErrors.InvalidSelection,
    })
  );
}
