/** Query keys that must not drive room/booking pages; use booking session token instead. */
export const BOOKING_QUERY_PARAM_KEYS = [
  "checkInDate",
  "checkOutDate",
  "guestCount",
] as const;

export function hasBookingQueryParams(
  searchParams: Record<string, string | string[] | undefined>
): boolean {
  return BOOKING_QUERY_PARAM_KEYS.some((key) => {
    const value = searchParams[key];
    return value !== undefined && value !== "";
  });
}
