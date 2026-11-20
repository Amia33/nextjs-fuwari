"use server";

import { verify } from "@node-rs/argon2";
import { ipAddress, waitUntil } from "@vercel/functions";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getGate } from "@/src/server/auth/gate";
import { clearClient, limit } from "@/src/server/auth/rate-limit";
import { unlockCookie, type GateKind } from "@/src/server/auth/session";

export type UnlockResult =
  { ok: true } | { ok: false; reason: "wrong" | "throttled" };

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

  const address = await clientAddress();
  const { throttled, settle } = await limit(
    `${address}:${kind}:${id}`,
    `${kind}:${id}`,
  );
  waitUntil(Promise.all(settle));

  if (throttled) return { ok: false, reason: "throttled" };

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
