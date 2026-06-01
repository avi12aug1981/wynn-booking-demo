import crypto from "crypto";
import { apiServerError } from "./api-response";
import { logger } from "@/lib/logger";
import { LogEvents } from "@/constants";

export type ApiRequestHandler<T> = () => Promise<T>;

export async function handleApiRequest<T>(
  operationName: string,
  handler: ApiRequestHandler<T>
) {
  const traceId = crypto.randomUUID();

  try {
    logger.info(operationName, LogEvents.ApiRequestStarted, {
      traceId,
    });

    const result = await handler();

    logger.info(operationName, LogEvents.ApiRequestCompleted, {
      traceId,
    });

    return result;
  } catch (error) {
    logger.error(operationName, LogEvents.ApiRequestFailed, {
      traceId,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    });

    return apiServerError(traceId);
  }
}