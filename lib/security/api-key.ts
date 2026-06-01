import { NextRequest } from "next/server";
import { SecurityConstants } from "@/constants";

export function validateApiKey(request: NextRequest): boolean {
  const configuredKey =
    process.env.INTERNAL_API_KEY ??
    SecurityConstants.DefaultInternalApiKey;

  const suppliedKey = request.headers.get(
    SecurityConstants.ApiKeyHeaderName
  );

  return suppliedKey === configuredKey;
}