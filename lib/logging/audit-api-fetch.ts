import { getMemberAuditContext } from "./member-context";
import { getOrCreateSessionTraceId } from "./correlation";
import { writeAuditEvent } from "./write-audit-event";
import {
  CLIENT_OPERATION_HEADER,
  CORRELATION_HEADER,
} from "./audit-event";

/**
 * All .NET API calls from the UI go through here so logs share traceId with the API file.
 */
export async function auditApiFetch(
  operation: string,
  input: string,
  init?: RequestInit
): Promise<Response | null> {
  const traceId = getOrCreateSessionTraceId();
  const memberContext = getMemberAuditContext();
  const headers = new Headers(init?.headers);
  headers.set(CORRELATION_HEADER, traceId);
  headers.set(CLIENT_OPERATION_HEADER, operation);

  const method = init?.method ?? "GET";
  const started = Date.now();

  await writeAuditEvent({
    level: "info",
    layer: "UI",
    traceId,
    operation,
    phase: "request",
    message: `${method} ${operation}`,
    path: input,
    method,
    ...memberContext,
  });

  let response: Response | null = null;

  try {
    response = await fetch(input, { ...init, headers });
  } catch (error) {
    await writeAuditEvent({
      level: "error",
      layer: "UI",
      traceId,
      operation,
      phase: "network-error",
      message: `Network error during ${operation}`,
      path: input,
      method,
      durationMs: Date.now() - started,
      details:
        error instanceof Error
          ? { name: error.name, message: error.message }
          : undefined,
      ...memberContext,
    });

    return null;
  }

  let apiTraceId: string | undefined;

  try {
    const clone = response.clone();
    const json = (await clone.json()) as {
      traceId?: string | null;
      data?: { accessToken?: string };
    };
    apiTraceId = json.traceId ?? undefined;
    // Never log json.data.accessToken — login responses stay out of audit details.
  } catch {
    apiTraceId = response.headers.get(CORRELATION_HEADER) ?? undefined;
  }

  await writeAuditEvent({
    level: response.ok ? "info" : "warn",
    layer: "UI",
    traceId,
    operation,
    phase: "response",
    message: `${method} ${operation} -> ${response.status}`,
    path: input,
    method,
    statusCode: response.status,
    durationMs: Date.now() - started,
    apiTraceId: apiTraceId ?? null,
    ...memberContext,
  });

  return response;
}
