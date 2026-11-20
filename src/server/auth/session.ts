import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { getGate } from "./gate";

export type GateKind = "post" | "moment" | "album";

const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function secret(): string {
  const value = process.env.GATE_SECRET;
  if (!value || value.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "GATE_SECRET must be set to at least 32 characters in production. Generate one with: openssl rand -base64 32",
      );
    }
    return "development-only-insecure-gate-secret-do-not-use";
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function shortHash(value: string): string {
  return createHash("sha256").update(value).digest("base64url").slice(0, 16);
}

/**
 * Cookie names carry a digest of the item id, not the id itself: two long
 * slugs must not collide on one cookie, and the cookie jar should not spell
 * out which private pages exist.
 *
 * The `__Host-` prefix pins the cookie to this origin and to `path: "/"`. It
 * requires `Secure`, which is dropped in development, so the prefix is too —
 * browsers silently reject a `__Host-` cookie set over http.
 */
function cookieName(kind: GateKind, id: string): string {
  const prefix = process.env.NODE_ENV === "production" ? "__Host-" : "";
  return `${prefix}pp_${kind}_${shortHash(id)}`;
}

/**
 * The token carries a fingerprint of the password hash it was minted against,
 * so editing `passwordHash` invalidates every outstanding cookie for that item
 * without touching the signing secret.
 */
export function createToken(kind: GateKind, id: string, hash: string): string {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${kind}:${id}.${expiresAt}.${shortHash(hash)}`;
  return `${expiresAt}.${sign(payload)}`;
}

export function verifyToken(
  kind: GateKind,
  id: string,
  token: string | undefined,
  hash: string,
): boolean {
  if (!token) return false;

  const separator = token.indexOf(".");
  if (separator === -1) return false;

  const expiresAt = Number(token.slice(0, separator));
  const signature = token.slice(separator + 1);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = sign(`${kind}:${id}.${expiresAt}.${shortHash(hash)}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isUnlocked(kind: GateKind, id: string): Promise<boolean> {
  const gate = getGate(kind, id);
  if (!gate) return false;

  const store = await cookies();
  const token = store.get(cookieName(kind, id))?.value;
  return verifyToken(kind, id, token, gate.hash);
}

export async function unlockCookie(kind: GateKind, id: string, hash: string) {
  const store = await cookies();
  store.set(cookieName(kind, id), createToken(kind, id, hash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // `strict` keeps the unlock cookie off cross-site requests entirely. The
    // trade-off: arriving from an external link, the first request carries no
    // cookie, so a visitor sees the gate once and unlocks it. For a private
    // blog that is a good trade against CSRF.
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    priority: "high",
  });
}

/** Non-sensitive cookie name, exported so the gate UI can stay in sync. */
export { cookieName };
