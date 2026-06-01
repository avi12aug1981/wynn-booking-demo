import fs from "fs";
import path from "path";

export type LogLevel = "debug" | "info" | "warn" | "error";

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

/**
 * File-based logger provider.
 *
 * This provider writes structured application events to a local file.
 * Business services remain independent from the logging destination.
 */
class FileLoggerProvider implements LoggerProvider {
  private readonly logDirectory = path.join(process.cwd(), "logs");
  private readonly logFilePath = path.join(
    this.logDirectory,
    "application.log"
  );

  write(entry: LogEntry): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }

    fs.appendFileSync(this.logFilePath, `${JSON.stringify(entry)}\n`, {
      encoding: "utf-8",
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