const SESSION_TRACE_KEY = "wynn-session-trace-id";

/** Stable id for the browser session (guest or member). Sent as X-Correlation-Id on every API call. */
export function getOrCreateSessionTraceId(): string {
  if (typeof window !== "undefined") {
    const existing = sessionStorage.getItem(SESSION_TRACE_KEY);

    if (existing) {
      return existing;
    }

    const created = crypto.randomUUID().replace(/-/g, "");
    sessionStorage.setItem(SESSION_TRACE_KEY, created);
    return created;
  }

  return crypto.randomUUID().replace(/-/g, "");
}

export function resetSessionTraceId(): string {
  const created = crypto.randomUUID().replace(/-/g, "");

  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_TRACE_KEY, created);
  }

  return created;
}
