import { readFile, stat } from "node:fs/promises";
import { join, sep } from "node:path";

import { isAssetCollection } from "@/src/content/assets";
import { getGate } from "@/src/server/auth/gate";
import { isUnlocked, type GateKind } from "@/src/server/auth/session";

const CONTENT_ROOT = join(process.cwd(), "content");

const SEGMENT = /^[a-z0-9][a-z0-9._-]*$/i;

/** URL collections are plural; gate kinds are singular. */
const GATE_KIND: Record<string, GateKind> = {
  posts: "post",
  moments: "moment",
  albums: "album",
};

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
};

function notFound() {
  // 404 rather than 403: a locked asset should not confirm that it exists.
  return new Response(null, {
    status: 404,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (path.length < 3) return notFound();

  const [collection, slug, ...rest] = path;
  if (!isAssetCollection(collection)) return notFound();
  const kind = GATE_KIND[collection];
  if (!kind) return notFound();
  if (!SEGMENT.test(slug)) return notFound();
  if (rest.length === 0) return notFound();
  for (const segment of rest) {
    if (!SEGMENT.test(segment)) return notFound();
  }

  const file = join(CONTENT_ROOT, collection, slug, ...rest);
  // Defence in depth: the segment check above already rejects `..`, but the
  // resolved path must still stay inside `content/`.
  if (!file.startsWith(CONTENT_ROOT + sep)) return notFound();

  const gate = getGate(kind, slug);
  if (!gate) return notFound();
  if (!(await isUnlocked(kind, slug))) return notFound();

  const extension = rest[rest.length - 1].slice(
    rest[rest.length - 1].lastIndexOf("."),
  );
  const contentType = CONTENT_TYPES[extension.toLowerCase()];
  if (!contentType) return notFound();

  let body: Buffer;
  try {
    const info = await stat(file);
    if (!info.isFile()) return notFound();
    body = await readFile(file);
  } catch {
    return notFound();
  }

  return new Response(new Uint8Array(body), {
    status: 200,
    headers: {
      // `private` keeps shared caches out; `no-store` keeps unlocked media from
      // outliving the cookie that authorised it.
      "Cache-Control": "private, no-store",
      "Content-Type": contentType,
      "Content-Length": String(body.byteLength),
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
