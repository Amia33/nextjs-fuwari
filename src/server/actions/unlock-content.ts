"use server";

import { verify } from "@node-rs/argon2";
import { ipAddress, waitUntil } from "@vercel/functions";
import { checkBotId } from "botid/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getGate } from "@/src/server/auth/gate";
import { clearClient, limit } from "@/src/server/auth/rate-limit";
import { unlockCookie, type GateKind } from "@/src/server/auth/session";

export type UnlockResult =
  { ok: true } | { ok: false; reason: "wrong" | "throttled" | "bot" };

const UnlockInput = z.tuple([
  z.enum(["post", "moment", "album"]),
  z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9][a-z0-9._-]*$/i),
  z.string().min(1).max(256),
]);

/**
 * Vercel sanitises the client address and exposes it through `ipAddress()`;
 * `x-forwarded-for` is not forwarded from outside, so it is only a
 * local-development fallback.
 */
async function clientAddress(): Promise<string> {
  const store = await headers();
  const address = ipAddress(new Headers(store));
  if (address) return address;

  return store.get("x-real-ip") ?? "unknown";
}

/** The route that renders a given gated item, for targeted revalidation. */
function unlockedPath(kind: GateKind, id: string): string {
  if (kind === "moment") return "/moments";
  if (kind === "album") return `/albums/${id}`;
  return `/posts/${id}`;
}

/**
 * BotID only works on Vercel. Off-platform it either throws or warns about a
 * missing client-side registration, so skip it entirely when the client half
 * is disabled.
 *
 * `checkBotId` throws rather than returning a verdict when it cannot reach
 * Vercel's bot-protection API — off-platform, or on a project without OIDC
 * enabled. Treating that as "not a bot" keeps the unlock working everywhere;
 * the rate limiter and the password itself are still in force. It also means an
 * outage of the bot-protection API degrades protection instead of the site.
 */
async function isBot(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_BOTID_ENABLED !== "1") return false;

  try {
    const { isBot: detected } = await checkBotId();
    return detected;
  } catch (error) {
    console.warn("[botid] verification unavailable, allowing request", error);
    return false;
  }
}

export async function unlockContent(
  rawKind: GateKind,
  rawId: string,
  rawPassword: string,
): Promise<UnlockResult> {
  // Reject malformed input before it reaches Redis, Argon2, or `revalidatePath`.
  // The caller gets the same generic failure as a wrong password.
  const parsed = UnlockInput.safeParse([rawKind, rawId, rawPassword]);
  if (!parsed.success) return { ok: false, reason: "wrong" };

  const [kind, id, password] = parsed.data;

  // BotID runs first: it is the cheapest check and it keeps automated traffic
  // out of Argon2 and Redis entirely. It is an extra guard, not the gate, so a
  // failure to verify must not block real visitors — see `isBot`.
  if (await isBot()) {
    console.warn(`[gate] BotID flagged ${kind}/${id}: refused as "bot"`);
    return { ok: false, reason: "bot" };
  }

  const address = await clientAddress();
  const outcome = await limit(`${address}:${kind}:${id}`, `${kind}:${id}`);
  waitUntil(Promise.all(outcome.settle));

  if (outcome.throttled) {
    // `unavailable` means Redis could not be consulted. Fail-closed turns that
    // into a throttle, and the log line is what tells the two apart later.
    console.warn(
      `[gate] rate limited ${kind}/${id} (${outcome.reason}): refused as "throttled"`,
    );
    return { ok: false, reason: "throttled" };
  }

  const gate = getGate(kind, id);
  if (!gate) {
    // No such protected item — same generic failure as a wrong password. The
    // attempt has already been charged against both tiers.
    return { ok: false, reason: "wrong" };
  }

  let valid = false;
  try {
    valid = await verify(gate.hash, password);
  } catch {
    valid = false;
  }

  if (!valid) return { ok: false, reason: "wrong" };

  await clearClient(`${address}:${kind}:${id}`);
  await unlockCookie(kind, id, gate.hash);
  // Revalidate only the page that just unlocked. Invalidating the root layout
  // would discard the static shell of every partial-prerender route, which then
  // have to be regenerated on their next request — and that regeneration bails
  // on `params` outside `<Suspense>`, turning unrelated routes into 500s.
  revalidatePath(unlockedPath(kind, id));
  return { ok: true };
}
