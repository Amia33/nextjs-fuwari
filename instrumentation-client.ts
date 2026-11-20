import { initBotId } from "botid/client/core";

/**
 * BotID attaches verification headers to requests matching these paths.
 *
 * Only the unlock Server Action is protected, and it is keyed by the page the
 * action POSTs to rather than by an API route: Next Server Actions post to the
 * current URL. Those paths are the only ones that run Argon2 and touch Redis.
 *
 * Gated media (`/vault/*`) is deliberately excluded. It is fetched by `<img>`
 * tags, which never run this script, so protection there would only break
 * legitimate image loads.
 *
 * Skipped outside Vercel: `initBotId()` injects a script that only Vercel's
 * network serves, and a 404 there breaks the page's client runtime.
 */
if (process.env.NEXT_PUBLIC_BOTID_ENABLED === "1") {
  initBotId({
    protect: [
      { path: "/posts/*", method: "POST" },
      { path: "/albums/*", method: "POST" },
      { path: "/moments", method: "POST" },
    ],
  });
}
