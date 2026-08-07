/**
 * A small in-memory rate limiter for the public submission endpoint.
 *
 * Per-process and therefore imperfect behind multiple instances — it's a speed
 * bump against someone pasting the same joke four hundred times, not a security
 * control. The real protection is that submissions land in a `pending` queue
 * and a human approves them before anything reaches the site.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const globalForLimit = globalThis as unknown as { __tifLimit?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = (globalForLimit.__tifLimit ??= new Map());

export interface LimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number;
}

export function rateLimit(key: string, max = 5, windowMs = 60_000): LimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfter: 0 };
  }

  bucket.count += 1;

  if (bucket.count > max) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { ok: true, remaining: max - bucket.count, retryAfter: 0 };
}

/** Best-effort client identity from proxy headers. */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Keeps the map from growing without bound in a long-lived process. */
export function sweepBuckets(): void {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (now > v.resetAt) buckets.delete(k);
  }
}
