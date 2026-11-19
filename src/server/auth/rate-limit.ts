import "server-only";

/**
 * Fixed-window rate limiter held in module memory.
 *
 * On Vercel serverless this is per-instance, so a determined attacker with
 * enough concurrency can exceed the nominal limit by spreading across lambdas.
 * That is an accepted trade-off for a single-author blog; swap in Upstash
 * Redis if the site ever draws real abuse.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_KEYS = 5000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function sweep(now: number) {
  if (buckets.size <= MAX_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function isThrottled(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) return false;
  return bucket.count >= MAX_ATTEMPTS;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    sweep(now);
    return;
  }

  bucket.count += 1;
}

export function clearFailures(key: string): void {
  buckets.delete(key);
}
