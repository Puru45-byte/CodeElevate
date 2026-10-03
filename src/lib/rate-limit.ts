// Basic in-memory rate limiter for serverless environments.
// Note: In a true distributed Vercel edge/serverless setup, this is per-instance.
// For production, consider using Vercel KV or Upstash Redis.

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = store.get(ip);

  // Clean up old entries periodically to prevent memory leaks
  if (store.size > 10000) {
    for (const [key, val] of store.entries()) {
      if (val.resetTime < now) {
        store.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    store.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true; // Allowed
  }

  if (record.count >= limit) {
    return false; // Rate limited
  }

  record.count += 1;
  store.set(ip, record);
  return true; // Allowed
}
