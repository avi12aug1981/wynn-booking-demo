import developmentDefaults from "../../config/development.defaults.json";

const { appBase, bookingApi } = developmentDefaults.urls;

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function fromEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? trimTrailingSlash(value) : undefined;
}

/** Public site origin (confirmation links, legacy email). */
export function getAppBaseUrl(): string {
  return (
    fromEnv("NEXT_PUBLIC_APP_URL") ??
    fromEnv("NEXT_PUBLIC_BASE_URL") ??
    trimTrailingSlash(appBase)
  );
}

/** ASP.NET Core booking API origin (browser calls directly). */
export function getBookingApiUrl(): string {
  return (
    fromEnv("NEXT_PUBLIC_BOOKING_API_URL") ?? trimTrailingSlash(bookingApi)
  );
}

export const appUrls = {
  appBase: getAppBaseUrl(),
  bookingApi: getBookingApiUrl(),
} as const;
