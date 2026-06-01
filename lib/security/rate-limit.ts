type RateLimitEntry = {
    count: number;
    expiresAt: number;
  };
  
  const rateLimitStore = new Map<string, RateLimitEntry>();
  
  export function isRateLimited(
    key: string,
    options: {
      maxRequests: number;
      windowMs: number;
    }
  ): boolean {
    const now = Date.now();
    const existing = rateLimitStore.get(key);
  
    if (!existing || existing.expiresAt < now) {
      rateLimitStore.set(key, {
        count: 1,
        expiresAt: now + options.windowMs,
      });
  
      return false;
    }
  
    existing.count += 1;
  
    return existing.count > options.maxRequests;
  }