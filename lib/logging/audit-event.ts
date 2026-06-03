export type AuditLayer = "UI" | "API" | "Database";

export type AuditLogLevel = "debug" | "info" | "warn" | "error";

/** One line in logs/wynn-booking-audit.jsonl — shared by UI, API (Serilog), and DB audit. */
export type AuditLogEvent = {
  timestamp: string;
  level: AuditLogLevel;
  layer: AuditLayer;
  traceId: string;
  message: string;
  operation?: string;
  phase?: string;
  memberId?: number | null;
  memberEmail?: string | null;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  apiTraceId?: string | null;
  details?: Record<string, unknown>;
};

export const AUDIT_LOG_FILENAME = "wynn-booking-audit.jsonl";

export const CORRELATION_HEADER = "X-Correlation-Id";
export const CLIENT_OPERATION_HEADER = "X-Client-Operation";
