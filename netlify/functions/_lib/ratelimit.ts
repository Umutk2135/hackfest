/**
 * OWNER: P2 (Backend)
 * In-memory token bucket per (key). Resets every cold start — fine for hackathon scale.
 * Used to prevent runaway LLM cost from a single client.
 */

interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  capacity: number;
  refillPerSecond: number;
}

export function take(key: string, opts: RateLimitOptions = { capacity: 10, refillPerSecond: 0.2 }): boolean {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: opts.capacity, lastRefillMs: now };
  const elapsedSec = (now - b.lastRefillMs) / 1000;
  b.tokens = Math.min(opts.capacity, b.tokens + elapsedSec * opts.refillPerSecond);
  b.lastRefillMs = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return true;
}

export function clientKey(req: Request): string {
  return (
    req.headers.get('x-nf-client-connection-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}
