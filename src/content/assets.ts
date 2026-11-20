/**
 * Where a content document's assets live.
 *
 * Two namespaces, decided by the owning document's gate state:
 *
 * - public documents are copied into `public/assets/<collection>/<slug>/` at
 *   build time and served straight from the CDN, optimizable by `next/image`;
 * - protected documents stay in `content/` and are only reachable through the
 *   `/vault` route, which checks the unlock cookie.
 *
 * Absolute refs (`/foo.png`) are left alone: they mean "a site-wide asset in
 * `public/`", not a per-document file.
 */
const COLLECTIONS = ["posts", "moments", "albums"] as const;

export type AssetCollection = (typeof COLLECTIONS)[number];

export function isAssetCollection(value: string): value is AssetCollection {
  return (COLLECTIONS as readonly string[]).includes(value);
}

/** Optional external origin for public assets (Cloudflare R2, a CDN, ...). */
export function mediaOrigin(): string {
  return process.env.NEXT_PUBLIC_MEDIA_ORIGIN?.replace(/\/+$/, "") ?? "";
}

export function assetUrl(
  collection: AssetCollection,
  slug: string,
  ref: string,
  gated: boolean,
): string {
  if (/^[a-z]+:\/\//i.test(ref) || ref.startsWith("/")) return ref;

  const path = ref.replace(/^\.\//, "");
  // Gated media must stay on this origin: the route is the only thing that can
  // authorise it, so it can never be relocated to a public bucket.
  if (gated) return `/vault/${collection}/${slug}/${path}`;

  return `${mediaOrigin()}/assets/${collection}/${slug}/${path}`;
}
