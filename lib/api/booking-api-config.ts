import { SecurityConstants } from "@/constants";
import { getBookingApiUrl } from "@/lib/config/app-urls";

export const bookingApiConfig = {
  dotnetApiUrl: getBookingApiUrl(),

  apiKey:
    process.env.NEXT_PUBLIC_INTERNAL_API_KEY ??
    SecurityConstants.DefaultInternalApiKey,

  apiKeyHeaderName: SecurityConstants.ApiKeyHeaderName,
} as const;
