import { SecurityConstants } from "@/constants";

export const bookingApiConfig = {
  dotnetApiUrl:
    process.env.NEXT_PUBLIC_BOOKING_API_URL?.replace(/\/$/, "") ??
    "http://localhost:5116",

  apiKey:
    process.env.NEXT_PUBLIC_INTERNAL_API_KEY ??
    SecurityConstants.DefaultInternalApiKey,

  apiKeyHeaderName: SecurityConstants.ApiKeyHeaderName,
} as const;
