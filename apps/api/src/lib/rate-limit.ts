// Per-key sliding-window rate limiter for the agent path. The api_keys row
// carries rate_limit_per_minute (default 120); this enforces it.
//
// Implementation: a Map<keyHash, RateState> kept in module scope. Each
// Worker isolate gets its own map, so multiple isolates undercount slightly —
// fine for v0. To be globally consistent under serious traffic we'd back this
// with a Durable Object or Cloudflare KV (token bucket). Documented as a
// known limit so future-us doesn't think this is exact.

const TOKEN_LIMIT = "tokensRemaining";

type RateState = {
  // Refill bucket. Tokens = remaining requests in the current window.
  // Refill all the way back to `limit` every minute.
  tokens: number;
  windowStart: number; // epoch ms
};

const buckets = new Map<string, RateState>();

export type RateLimitResult =
  | { ok: true; limit: number; remaining: number; resetAt: number }
  | { ok: false; limit: number; remaining: 0; resetAt: number };

/**
 * Check + consume one token from the rate-limit bucket for `keyHash`.
 * Returns { ok: false } if the bucket is empty for this minute.
 *
 * Sliding window approximation: window resets at the start of every minute.
 * Cheaper than true sliding window, accurate enough for abuse defense.
 */
export function checkRateLimit(keyHash: string, limit: number): RateLimitResult {
  const now = Date.now();
  const minuteStart = Math.floor(now / 60_000) * 60_000;
  const resetAt = minuteStart + 60_000;

  const state = buckets.get(keyHash);
  if (!state || state.windowStart !== minuteStart) {
    // New minute — reset.
    const newState: RateState = { tokens: limit - 1, windowStart: minuteStart };
    buckets.set(keyHash, newState);
    // Opportunistic GC: drop ancient entries every ~100 calls.
    if (buckets.size > 1000 && Math.random() < 0.01) {
      sweepExpired(now);
    }
    return { ok: true, limit, remaining: newState.tokens, resetAt };
  }

  if (state.tokens <= 0) {
    return { ok: false, limit, remaining: 0, resetAt };
  }

  state.tokens -= 1;
  return { ok: true, limit, remaining: state.tokens, resetAt };
}

function sweepExpired(now: number) {
  const cutoff = now - 120_000; // anything older than 2 minutes is dead
  for (const [k, v] of buckets) {
    if (v.windowStart < cutoff) buckets.delete(k);
  }
}
