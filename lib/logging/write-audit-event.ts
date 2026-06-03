import type { AuditLogEvent } from "./audit-event";

/** Browser → same-origin route; server → file append directly. */
export async function writeAuditEvent(
  event: Omit<AuditLogEvent, "timestamp"> & { timestamp?: string }
): Promise<void> {
  const payload: AuditLogEvent = {
    timestamp: event.timestamp ?? new Date().toISOString(),
    level: event.level,
    layer: event.layer,
    traceId: event.traceId,
    message: event.message,
    operation: event.operation,
    phase: event.phase,
    memberId: event.memberId,
    memberEmail: event.memberEmail,
    path: event.path,
    method: event.method,
    statusCode: event.statusCode,
    durationMs: event.durationMs,
    apiTraceId: event.apiTraceId,
    details: event.details,
  };

  if (typeof window === "undefined") {
    const { appendAuditEvent } = await import("./append-audit-server");
    appendAuditEvent(payload);
    return;
  }

  try {
    await fetch("/api/diagnostics/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Logging must not break booking flows.
  }
}
