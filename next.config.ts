import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

import { TOKEN_NAMES, URL_NAMES, upstash } from "./src/server/auth/upstash-env";

/**
 * Security headers, applied to every route.
 *
 * `X-Frame-Options` is redundant next to the CSP `frame-ancestors` directive,
 * but the CSP is report-only for now, so it is the only live framing defence
 * in front of the password gate.
 *
 * CSP stays report-only deliberately: the theme script in `app/layout.tsx` is
 * injected inline, which `script-src 'self'` forbids. A nonce would mean
 * opting the whole app out of static rendering, so the eventual fix is an
 * inline-script hash or SRI, not a nonce.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "media-src 'self'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy-Report-Only",
    value: CSP_REPORT_ONLY,
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/**
 * Rate limiting is fail-closed, so a production build without Upstash would
 * deploy a site where every unlock is refused. Stop the build instead, while the
 * message can still name the variables.
 *
 * Run here rather than in a script because `next build` loads `.env*` before
 * evaluating this file, so it sees exactly what the runtime will. Every other
 * command only warns: `pnpm dev` and `next start` must not need the check.
 * The command is read the same way the content-collections plugin reads it.
 */
function requireUpstash() {
  const [command] = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
  if (command !== "build" || upstash()) return;

  const message =
    "Upstash Redis is required for rate limiting, but neither " +
    `${URL_NAMES.join(" nor ")} and neither ${TOKEN_NAMES.join(" nor ")} ` +
    "are set. Configure the Upstash integration, or the password gate would " +
    "refuse every unlock in production.";
  throw new Error(message);
}

requireUpstash();

const baseConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  env: {
    // BotID only works on Vercel: `initBotId()` loads a script that Vercel's
    // network serves, and on any other host it 404s and takes the page's
    // client runtime down with it. Inlined into the bundle at build time so
    // the client can skip registering it elsewhere.
    NEXT_PUBLIC_BOTID_ENABLED: process.env.VERCEL ? "1" : "0",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Only build-synced public content assets are optimizable. `/vault/**` is
    // listed because `next/image` validates the `src` against these patterns
    // even when `unoptimized` is set; those components never ask the optimizer
    // for a variant, and a direct optimizer request for a gated URL 404s
    // because the optimizer fetches without the visitor's cookies.
    localPatterns: [{ pathname: "/assets/**" }, { pathname: "/vault/**" }],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.446256.xyz",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // The vault route reads gated media from `content/` with `fs`, which the
  // tracer cannot follow. Without this the files are missing from the function
  // bundle and every gated asset 404s in production.
  outputFileTracingIncludes: {
    "/vault/\\[\\[\\.\\.\\.path\\]\\]": ["./content/**/*"],
  },
};

export default withContentCollections(baseConfig);
