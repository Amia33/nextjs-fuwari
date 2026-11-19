import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

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

function cookieName(kind: GateKind, id: string): string {
  return `pp_${kind}_${id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40)}`;
}

export function createToken(kind: GateKind, id: string): string {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${kind}:${id}.${expiresAt}`;
  return `${expiresAt}.${sign(payload)}`;
}

export function verifyToken(
  kind: GateKind,
  id: string,
  token: string | undefined,
): boolean {
  if (!token) return false;

  const separator = token.indexOf(".");
  if (separator === -1) return false;

  const expiresAt = Number(token.slice(0, separator));
  const signature = token.slice(separator + 1);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = sign(`${kind}:${id}.${expiresAt}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isUnlocked(kind: GateKind, id: string): Promise<boolean> {
  const store = await cookies();
  const token = store.get(cookieName(kind, id))?.value;
  return verifyToken(kind, id, token);
}

export async function unlockCookie(kind: GateKind, id: string) {
  const store = await cookies();
  store.set(cookieName(kind, id), createToken(kind, id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Non-sensitive cookie name, exported so the gate UI can stay in sync. */
export { cookieName };
