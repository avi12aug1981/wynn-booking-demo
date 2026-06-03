export const AppRoutes = {
  landing: "/",
  login: "/login",
  search: "/search",
  reservations: "/reservations",
} as const;

export function buildLoginUrl(bookingError?: string) {
  if (!bookingError) {
    return AppRoutes.landing;
  }

  const params = new URLSearchParams({ bookingError });
  return `${AppRoutes.landing}?${params.toString()}`;
}

export function buildBookingUrl(token: string) {
  return `/booking/${token}`;
}

export function buildRoomDetailsUrl(roomId: number, token: string) {
  return `/rooms/${roomId}/${token}`;
}

export function buildSearchUrl(params: {
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: string;
  bookingError?: string;
  unavailableRoomId?: number;
}) {
  const search = new URLSearchParams();

  if (params.checkInDate) {
    search.set("checkInDate", params.checkInDate);
  }

  if (params.checkOutDate) {
    search.set("checkOutDate", params.checkOutDate);
  }

  if (params.guestCount) {
    search.set("guestCount", params.guestCount);
  }

  if (params.bookingError) {
    search.set("bookingError", params.bookingError);
  }

  if (params.unavailableRoomId) {
    search.set("unavailableRoomId", String(params.unavailableRoomId));
  }

  const query = search.toString();
  return query ? `${AppRoutes.search}?${query}` : AppRoutes.search;
}

export function buildRoomDetailsStartUrl(params: {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: string;
}) {
  const search = new URLSearchParams({
    roomId: String(params.roomId),
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
    guestCount: params.guestCount,
  });

  return `/api/booking-sessions/room-details?${search}`;
}
