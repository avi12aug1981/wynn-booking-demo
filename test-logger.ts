import { logger } from "./lib/logger";

logger.info(
  "ApplicationStartup",
  "Logger verification successful",
  {
    environment: "local",
    feature: "logging",
  }
);
