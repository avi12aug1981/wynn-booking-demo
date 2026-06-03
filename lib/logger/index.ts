import type { AuditLogLevel } from "@/lib/logging/audit-event";
import { appendAuditEvent } from "@/lib/logging/append-audit-server";

export type LogLevel = AuditLogLevel;

export type LogContext = Record<string, unknown>;

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  context?: LogContext;
};

export interface LoggerProvider {
  write(entry: LogEntry): void;
}

/** Legacy Next.js API routes → same unified audit file as the UI and .NET API. */
class FileLoggerProvider implements LoggerProvider {
  write(entry: LogEntry): void {
    appendAuditEvent({
      timestamp: entry.timestamp,
      level: entry.level,
      layer: "UI",
      traceId: "next-server",
      message: entry.message,
      operation: entry.source,
      details: entry.context,
    });
  }
}

/**
 * Console logger provider for cloud environments where stdout/stderr
 * are captured by the hosting platform.
 */
class ConsoleLoggerProvider implements LoggerProvider {
  write(entry: LogEntry): void {
    console[entry.level](JSON.stringify(entry));
  }
}

/**
 * Logger facade used by application code.
 *
 * Business code calls logger.info/error/etc. and does not know whether
 * logs are written to a file, console, Application Insights, or another sink.
 */
class AppLogger {
  private readonly provider: LoggerProvider;

  constructor(provider?: LoggerProvider) {
    this.provider =
      process.env.LOG_PROVIDER === "console"
        ? new ConsoleLoggerProvider()
        : provider ?? new FileLoggerProvider();
  }

  private write(
    level: LogLevel,
    source: string,
    message: string,
    context?: LogContext
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      context,
    };

    this.provider.write(entry);
  }

  debug(source: string, message: string, context?: LogContext) {
    this.write("debug", source, message, context);
  }

  info(source: string, message: string, context?: LogContext) {
    this.write("info", source, message, context);
  }

  warn(source: string, message: string, context?: LogContext) {
    this.write("warn", source, message, context);
  }

  error(source: string, message: string, context?: LogContext) {
    this.write("error", source, message, context);
  }
}

export const logger = new AppLogger();