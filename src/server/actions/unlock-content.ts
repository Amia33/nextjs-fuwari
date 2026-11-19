"use server";

import { verify } from "@node-rs/argon2";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { getGate } from "@/src/server/auth/gate";
import {
  clearFailures,
  isThrottled,
  recordFailure,
} from "@/src/server/auth/rate-limit";
import { unlockCookie, type GateKind } from "@/src/server/auth/session";

export type UnlockResult =
  { ok: true } | { ok: false; reason: "wrong" | "throttled" };

async function clientKey(kind: GateKind, id: string): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ?? store.get("x-real-ip") ?? "unknown";
  return `${ip}:${kind}:${id}`;
}

export async function unlockContent(
  kind: GateKind,
  id: string,
  password: string,
): Promise<UnlockResult> {
  const key = await clientKey(kind, id);

  if (isThrottled(key)) return { ok: false, reason: "throttled" };

  const gate = getGate(kind, id);
  if (!gate) {
    // No such protected item — same generic failure as a wrong password.
    recordFailure(key);
    return { ok: false, reason: "wrong" };
  }

  let valid = false;
  try {
    valid = await verify(gate.hash, password);
  } catch {
    valid = false;
  }

  if (!valid) {
    recordFailure(key);
    return { ok: false, reason: "wrong" };
  }

  clearFailures(key);
  await unlockCookie(kind, id);
  revalidatePath("/", "layout");
  return { ok: true };
}
