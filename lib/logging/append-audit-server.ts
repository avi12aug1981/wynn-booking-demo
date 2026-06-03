import fs from "fs";
import path from "path";
import type { AuditLogEvent } from "./audit-event";
import { AUDIT_LOG_FILENAME } from "./audit-event";

export function resolveAuditLogPath(): string {
  const override = process.env.AUDIT_LOG_PATH?.trim();

  if (override) {
    return path.isAbsolute(override)
      ? override
      : path.join(process.cwd(), override);
  }

  return path.join(process.cwd(), "logs", AUDIT_LOG_FILENAME);
}

/** Server-side append (Next.js route, SSR, legacy logger). */
export function appendAuditEvent(event: AuditLogEvent): void {
  const logPath = resolveAuditLogPath();
  const directory = path.dirname(logPath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  fs.appendFileSync(logPath, `${JSON.stringify(event)}\n`, { encoding: "utf-8" });
}
