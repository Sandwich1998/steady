type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalRateLimitStore = globalThis as typeof globalThis & {
  __steadyRateLimitStore?: Map<string, RateLimitEntry>;
};

function getStore() {
  if (!globalRateLimitStore.__steadyRateLimitStore) {
    globalRateLimitStore.__steadyRateLimitStore = new Map();
  }

  return globalRateLimitStore.__steadyRateLimitStore;
}

export function getRateLimitKey(request: Request, scope: string) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "local";

  return `${scope}:${ip}`;
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const store = getStore();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  store.set(key, entry);

  return { allowed: true, remaining: Math.max(limit - entry.count, 0) };
}
