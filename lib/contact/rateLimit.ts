/**
 * CONTACT FORM — basic rate limiting.
 *
 * A fixed window per client: at most `LIMIT` submissions every `WINDOW_MS`
 * from one IP address. The counts live in this module's memory.
 *
 * WHAT THIS IS AND ISN'T: on Vercel each serverless instance has its own
 * memory, and instances come and go, so this slows a burst from one address
 * rather than enforcing a hard quota. Together with the honeypot it is
 * enough to keep casual spam out. If the form is ever targeted, move the
 * counter to a shared store (Upstash Redis, Vercel KV) — `checkRateLimit`
 * is the only function that would change.
 */

const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

interface Bucket {
  count: number;
  /** When this bucket's window ends, ms since the epoch. */
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Drops expired buckets, so the map can't grow without bound. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the client may try again; 0 when allowed. */
  retryAfter: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (bucket.count >= LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}

/**
 * The caller's address. Vercel (and most proxies) put the real client first
 * in `x-forwarded-for`; locally there is no proxy, so everything shares one
 * bucket.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "local";
}
