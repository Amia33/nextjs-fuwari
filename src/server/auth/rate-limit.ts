import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting that survives across lambda instances.
 *
 * The previous implementation counted in module memory, which on Vercel means
 * one counter per instance: an attacker's attempts spread over a handful of
 * lambdas and none of them ever reached the limit. The counters now live in
 * Redis, so every instance shares them.
 *
 * Two limiter tiers:
 * - per client and item, matching the old semantics (5 failures / 15 min);
 * - per item overall, which bounds total Argon2 work when an attacker rotates
 *   source addresses.
 *
 * If Redis is unreachable the limiter fails open and logs. The Vercel WAF rule
 * is the outer guard, and a Redis outage must not lock the author out of their
 * own blog.
 */
const WINDOW = "15 m";
const MAX_ATTEMPTS = 5;
const MAX_ATTEMPTS_GLOBAL = 50;

function redis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

let client: Redis | null | undefined;

function clientOrNull(): Redis | null {
  if (client === undefined) client = redis();
  return client;
}

let perClient: Ratelimit | null | undefined;
let perItem: Ratelimit | null | undefined;

function limiters(): { perClient: Ratelimit; perItem: Ratelimit } | null {
  if (perClient === undefined || perItem === undefined) {
    const store = clientOrNull();
    if (!store) {
      perClient = null;
      perItem = null;
    } else {
      perClient = new Ratelimit({
        redis: store,
        prefix: "gate:client",
        limiter: Ratelimit.slidingWindow(MAX_ATTEMPTS, WINDOW),
      });
      perItem = new Ratelimit({
        redis: store,
        prefix: "gate:item",
        limiter: Ratelimit.slidingWindow(MAX_ATTEMPTS_GLOBAL, WINDOW),
      });
    }
  }

  if (!perClient || !perItem) return null;
  return { perClient, perItem };
}

export type LimitResult =
  { throttled: false } | { throttled: true; reason: "client" | "item" };

/**
 * True once either tier is exhausted. Consumes one attempt from both tiers.
 *
 * `settle` receives the analytics promise Upstash keeps off the hot path; the
 * caller hands it to `waitUntil` so the function can respond first.
 */
export async function limit(
  clientKey: string,
  itemKey: string,
): Promise<LimitResult & { settle: Promise<unknown>[] }> {
  const active = limiters();
  if (!active) return { throttled: false, settle: [] };

  try {
    const [byClient, byItem] = await Promise.all([
      active.perClient.limit(clientKey),
      active.perItem.limit(itemKey),
    ]);
    const settle = [byClient.pending, byItem.pending];

    if (!byClient.success) return { throttled: true, reason: "client", settle };
    if (!byItem.success) return { throttled: true, reason: "item", settle };
    return { throttled: false, settle };
  } catch (error) {
    console.error("[rate-limit] Redis unavailable, failing open", error);
    return { throttled: false, settle: [] };
  }
}

/**
 * A correct password should not leave the client's failure budget partly
 * spent, so a successful unlock clears the per-client counter for that item.
 * The per-item counter is intentionally left alone — it counts total work, and
 * clearing it would let one valid password reset an attack in progress.
 */
export async function clearClient(clientKey: string): Promise<void> {
  const active = limiters();
  if (!active) return;

  try {
    await active.perClient.resetUsedTokens(clientKey);
  } catch (error) {
    console.error("[rate-limit] Redis unavailable, could not clear", error);
  }
}
