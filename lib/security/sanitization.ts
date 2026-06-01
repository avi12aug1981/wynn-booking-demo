export function sanitizeText(value: unknown): string {
    if (typeof value !== "string") {
      return "";
    }
  
    return value.trim().replace(/[<>]/g, "");
  }
  
  export function sanitizeOptionalText(value: unknown): string | undefined {
    const sanitized = sanitizeText(value);
  
    return sanitized.length > 0 ? sanitized : undefined;
  }