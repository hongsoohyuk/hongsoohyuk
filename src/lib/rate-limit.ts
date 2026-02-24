type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitRecord>();

function cleanup() {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}

/**
 * Simple in-memory rate limiter (sliding window).
 * Best-effort protection for serverless — state resets on cold start.
 * For production-grade limiting, replace with Upstash Redis + @upstash/ratelimit.
 */
export function rateLimit(key: string, {limit, windowMs}: {limit: number; windowMs: number}) {
  cleanup();

  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetTime) {
    store.set(key, {count: 1, resetTime: now + windowMs});
    return {success: true, remaining: limit - 1};
  }

  if (record.count >= limit) {
    return {success: false, remaining: 0};
  }

  record.count++;
  return {success: true, remaining: limit - record.count};
}
