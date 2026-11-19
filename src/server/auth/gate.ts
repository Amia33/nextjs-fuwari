import "server-only";

import { allAlbums, allMoments, allPosts } from "content-collections";

import type { GateKind } from "./session";

export type Gate = { hash: string; hint?: string };

/**
 * The only place in the app that reads `passwordHash`.
 *
 * The query helpers in `src/content/*` strip the hash from everything they
 * return, so a stray import of those can never leak it to a client component.
 * Keep this module server-only and import it only from the Server Action and
 * the gate renderer.
 */
export function getGate(kind: GateKind, id: string): Gate | null {
  const source =
    kind === "post" ? allPosts : kind === "moment" ? allMoments : allAlbums;

  const doc = source.find((entry) => entry._meta.path === id);
  if (!doc || !doc.passwordProtected || !doc.passwordHash) return null;

  return { hash: doc.passwordHash, hint: doc.passwordHint };
}

export function isProtected(kind: GateKind, id: string): boolean {
  return getGate(kind, id) !== null;
}
