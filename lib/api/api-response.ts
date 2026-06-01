import { NextResponse } from "next/server";
import { ApiMessages } from "@/constants";

/**
 * Standard API response shape used by route handlers.
 *
 * A consistent response contract keeps frontend handling predictable
 * and avoids duplicated response formatting logic across API routes.
 */
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  traceId?: string;
};

type ApiResponseOptions = {
  status?: number;
  message?: string;
  traceId?: string;
};

/**
 * Returns a successful API response.
 */
export function apiOk<T>(
  data: T,
  options: ApiResponseOptions = {}
) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      message: options.message,
      traceId: options.traceId,
    },
    {
      status: options.status ?? 200,
    }
  );
}

/**
 * Returns a failed API response.
 */
export function apiFail(
  message: string,
  options: ApiResponseOptions & { errors?: string[] } = {}
) {
  return NextResponse.json<ApiResponse<never>>(
    {
      success: false,
      message,
      errors: options.errors,
      traceId: options.traceId,
    },
    {
      status: options.status ?? 400,
    }
  );
}

/**
 * Returns a validation failure response.
 */
export function apiValidationFail(
  errors: string[],
  traceId?: string
) {
  return apiFail(ApiMessages.ValidationFailed, {
    status: 400,
    errors,
    traceId,
  });
}

/**
 * Returns a generic internal server error response.
 *
 * Important:
 * Do not expose raw exception details to the client.
 * Log the technical details server-side using logger.
 */
export function apiServerError(traceId?: string) {
  return apiFail(ApiMessages.UnexpectedError, {
    status: 500,
    traceId,
  });
}