import { NextResponse } from "next/server";

import { siteConfig } from "@/src/config/site";

/**
 * Replaces the blanket `access-control-allow-origin: *` with this site's own
 * origin. Nothing on this blog is meant to be readable cross-origin, so the
 * wildcard is pure downside: it lets any page read HTML and loader data.
 *
 * Static assets are excluded — they are public by design, and rewriting them
 * per request would defeat their caching.
 */
export function proxy() {
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", siteConfig.url);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets|favicon.ico).*)"],
};
