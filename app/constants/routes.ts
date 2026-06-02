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
