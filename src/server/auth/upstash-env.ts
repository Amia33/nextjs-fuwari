/**
 * The URL and write token for Upstash Redis, or `null` when either is missing.
 *
 * The Vercel Marketplace integration exposes these either as
 * `UPSTASH_REDIS_REST_*` or under the legacy Vercel KV names — the same pair
 * `Redis.fromEnv()` falls back to. Accept both, preferring the Upstash names.
 *
 * Only a write-capable token works: the read-only one cannot run the limiter's
 * Lua script, and `KV_URL`/`REDIS_URL` are TCP URLs the REST client cannot use.
 *
 * `next.config.ts` imports this too, so the build gate and the limiter can never
 * disagree about what counts as configured.
 */
export const URL_NAMES = ["UPSTASH_REDIS_REST_URL", "KV_REST_API_URL"];
export const TOKEN_NAMES = ["UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_TOKEN"];

function pick(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
}

export function upstash(): { url: string; token: string } | null {
  const url = pick(URL_NAMES);
  const token = pick(TOKEN_NAMES);
  if (!url || !token) return null;
  return { url, token };
}
