# Amia33/nextjs-fuwari

A personal blog built on Next.js 16 (App Router, Turbopack), with content authored as MDX and
compiled through [content-collections](https://www.content-collections.dev/).

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Writing

Posts, moments, albums, series and spec pages live in `content/` and are **MDX only** (`.mdx`,
never `.md`). `content-collections.ts` validates each file's frontmatter with zod, so a typo in a
required field fails the build instead of rendering something broken.

```bash
pnpm new-post
```

prompts for a title, slug, category and tags, then creates `content/posts/<slug>.mdx`.

### Components available in any `.mdx` file

No imports are needed — these are registered globally.

| Component                                                         | Purpose                                        |
| ----------------------------------------------------------------- | ---------------------------------------------- |
| `<Alert type="note\|tip\|important\|warning\|caution" title="…">` | daisyUI alert                                  |
| `<Tabs items={["a","b"]}>` + `<Tab>`                              | tabbed panels                                  |
| `<Collapse title="…">`                                            | native `<details>` accordion, works without JS |
| `<Video src="/assets/clip.mp4" poster="…" title="…" />`           | local video via video.js v10                   |
| `<Audio src="/assets/clip.mp3" title="…" />`                      | local audio                                    |

Media are local asset paths only. Iframe embeds are not supported anywhere in the project.

Admonitions are **authored as components**, not derived from markdown syntax. GitHub-style
`> [!NOTE]` blockquotes render as ordinary blockquotes by design.

## Password-protected content

Posts, moments and albums can be gated. Only a hash is ever stored:

The repository ships three working examples: `content/posts/private-note/index.mdx`,
`content/moments/2026-11-17-unfinished/index.mdx`, and `content/albums/private-album/index.mdx`
(passwords `secret123`, `moment-pass`, and `album-pass` respectively — fixtures for local testing
only; delete them before publishing).

```bash
pnpm hash-password          # prompts twice without echoing, prints the YAML
pnpm hash-password --check '<phc>'   # verify an existing hash later
```

Paste the result into the frontmatter:

```yaml
passwordProtected: true
passwordHash: "$argon2id$v=19$m=19456,t=2,p=1$..."
passwordHint: "four words" # optional, public
```

Hashing uses Argon2id at the OWASP minimum (m=19456 KiB, t=2, p=1). The hash is safe to commit;
keep the plaintext in your password manager. A plaintext `password:` field is rejected at build
time.

Set `GATE_SECRET` (32+ random bytes) in production — the build fails without it:

```bash
openssl rand -base64 32
```

Unlocking sets an HttpOnly, SameSite=Strict cookie scoped to that one item, valid for 7 days. The
token embeds a fingerprint of the current `passwordHash`, so changing the password invalidates
every outstanding cookie for that item immediately. Verification is server-side; protected bodies
and their assets never appear in the prerendered HTML, the RSC payload, the sitemap, or any other
generated feed.

## Content layout

One directory per document, with its assets beside it:

```
content/posts/<slug>/index.mdx
content/posts/<slug>/cover.jpg
content/moments/<slug>/index.mdx
content/albums/<slug>/index.mdx
content/albums/<slug>/photo-1.jpg
```

Reference assets by bare filename in frontmatter (`image: cover.jpg`, `photos[].src: photo-1.jpg`)
and in the body (`![alt](cover.jpg)`). An absolute `/…` path still means a site-wide file in
`public/`. The trailing `/index` is stripped from the slug, so `content/posts/hello/index.mdx`
serves at `/posts/hello`.

Two namespaces follow from a document's gate state:

| Prefix                               | Served by                          | Gated |
| ------------------------------------ | ---------------------------------- | ----- |
| `/assets/<collection>/<slug>/<file>` | `public/assets/…`, copied on build | no    |
| `/vault/<collection>/<slug>/<file>`  | `app/vault/[...path]/route.ts`     | yes   |

`pnpm dev` / `pnpm build` run `scripts/sync-media.mjs` first: it copies assets for **public**
documents into `public/assets/` and skips protected ones entirely. Those copies are gitignored, so
the only source of truth is `content/`. A protected document that points at an absolute
`/assets/…` path fails the build — that would publish the file.

Gated media is rendered with `unoptimized`, because the `next/image` optimizer fetches sources
without the visitor's cookies and would 404. Unlocked media is served `private, no-store`.

Point `NEXT_PUBLIC_MEDIA_ORIGIN` at another origin (a Cloudflare R2 bucket on a custom domain,
say) to move **public** content assets off this deployment; gated media always stays on `/vault`.

## Configuration

| File                         | Controls                                          |
| ---------------------------- | ------------------------------------------------- |
| `src/config/site.ts`         | title, url, **language**, banner, timezone        |
| `src/config/profile.ts`      | avatar, name, bio, links                          |
| `src/config/article.ts`      | last-updated notice threshold                     |
| `src/config/announcement.ts` | sidebar announcement text, link, dismissable      |
| `src/config/sidebar.ts`      | column arrangement, widget collapse thresholds    |
| `src/config/post-list.ts`    | page size                                         |
| `src/config/analytics.ts`    | Vercel Analytics / Speed Insights on-off switches |

### Environment

| Variable                   | Purpose                                                       |
| -------------------------- | ------------------------------------------------------------- |
| `GATE_SECRET`              | signs unlock cookies; required in production                  |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST endpoint (falls back to `KV_REST_API_URL`) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash write token (falls back to `KV_REST_API_TOKEN`)       |
| `NEXT_PUBLIC_MEDIA_ORIGIN` | optional external origin for public content assets            |

Rate limiting is shared across instances in Redis, so five wrong passwords in fifteen minutes
throttle the attempt no matter which lambda serves it. The limiter is **fail-closed**: without a
working connection the unlock is refused rather than allowed, because the exposure is unbounded
Argon2 work. `next build` refuses to run at all when the Upstash variables are missing (see below);
at request time an unreachable Redis logs `[rate-limit] Redis unavailable` and refuses.

### Deploying to Vercel

Build settings:

| Setting         | Value             |
| --------------- | ----------------- |
| Install Command | `pnpm install`    |
| Build Command   | `pnpm build`      |
| Output          | `.next` (default) |

`pnpm build` is `pnpm sync-media && next build`. The sync step is **part of the script**, not a
`prebuild` hook, so it runs no matter who invokes it. A dashboard build command that calls the
binary directly — `pnpm next build` — bypasses package scripts entirely and leaves
`public/assets/{posts,moments,albums}` out of the deployment, which makes every public content
asset 404 and `next/image` answer 400.

Checklist after the first deploy:

1. Set `GATE_SECRET` (`openssl rand -base64 32`). Without it the build succeeds but every unlock
   throws in production.
2. Set the Upstash variables (below). **The build fails without them** — that is deliberate, so a
   deployment cannot go live with the gate refusing every unlock. Local `pnpm dev` is not gated.
3. Confirm a public asset loads: `/assets/avatar.png` is committed and should be `200`, and so
   should `/assets/posts/<slug>/cover.jpg` once the sync step ran.
4. Add the Firewall rules (below) and enable BotID Deep Analysis.

#### Upstash rate limiting

Add the Upstash integration from the Vercel Marketplace (Project → Storage → Upstash). It injects
several variables; which ones to use:

| Variable                                              | Use                                                        |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN`               | **Yes.** The pair the integration usually writes.          |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | **Yes**, if present — takes precedence.                    |
| `KV_URL`, `REDIS_URL`                                 | No — TCP URLs, the REST client cannot use them.            |
| `KV_REST_API_READ_ONLY_TOKEN`                         | No — the limiter runs a Lua script and needs write access. |

The code accepts either naming pair, so you do not need to rename anything. Only the URL and the
**write** token are required; `GATE_SECRET` is separate.

If they are missing, `next build` stops with a message naming both pairs. The check lives in
`next.config.ts` because Next loads `.env*` before evaluating that file, so it sees the same values
the runtime will. `pnpm dev` and `pnpm start` skip it.

#### Vercel Firewall

1. Project → **Firewall** → **Configure** → **+ New Rule**.
2. **If** → **Server Action Name** → **Equals** → pick
   `src/server/actions/unlock-content.ts#unlockContent` from the picker (typing it by hand is
   error-prone — the `<path>#<export>` format must match exactly).
3. **Then** → **Rate Limit** → fixed window, `60s`, limit `10`, key **IP**.
4. Start on **Log**, confirm matches in Firewall → Overview, then switch to **Deny (429)**.
5. Enable **BotID Deep Analysis** on the same page (Pro/Enterprise).

Do not scope this rule by request path: Server Actions POST to whatever route renders the form, so
the unlock action answers on `/posts/<slug>`, `/moments`, and `/albums/<id>` alike.

#### BotID

`instrumentation-client.ts` registers `initBotId()` for the paths the unlock action posts to, and
`unlockContent` calls `checkBotId()` before touching Redis or Argon2. BotID always reports
`isBot: false` in local development.

A BotID rejection and a rate-limit rejection are **distinct to the visitor**: a flagged browser is
told it was detected as automated and to reload, because waiting out the rate-limit window cannot
help it — it would just be flagged again. Headless browsers, some privacy tools and corporate
proxies trip BotID, so this is a real path, not a hypothetical one. Both are logged and are
distinguishable in the function logs:

```
[gate] BotID flagged post/<slug>: refused as "bot"
[gate] rate limited post/<slug> (client): refused as "throttled"
```

The second line's parenthetical is `client`, `item`, or `unavailable` (Redis could not be
consulted). Only a bot verdict is `"bot"`; everything the limiter refuses — including a Redis
outage, since the limiter is fail-closed — is `"throttled"`.

Testing note: BotID requires a real browser session. `curl` and direct route hits are classified
as bots in production, so exercise protected routes through the UI.

### Media on Cloudflare R2

Public content assets can be served from a bucket instead of this deployment. Gated media never
can — it must stay behind `/vault`.

1. Create an R2 bucket and attach a custom domain (e.g. `media.example.com`). Proxying it through
   your Cloudflare zone is what lets zone-level rules apply.
2. **Rules → Transform Rules → Modify Response Header** adds `X-Content-Type-Options: nosniff`
   (and `Content-Disposition: inline` if downloads default to attachment). Cache Rules cannot set
   arbitrary headers; they only control caching behaviour.
3. **Cache Rules** can set edge TTL / `immutable` for `/assets/**`, so you do not need per-object
   metadata when uploading through the dashboard.
4. Upload `public/assets/{posts,moments,albums}` with the same `<collection>/<slug>/<file>` paths,
   set `NEXT_PUBLIC_MEDIA_ORIGIN=https://media.example.com`, and redeploy. `remotePatterns` in
   `next.config.ts` already allows `media.446256.xyz`; change the hostname if yours differs.

`Content-Type` still comes from the object's extension at upload time — no rule can infer it. If a
rule appears to have no effect, check `cf-cache-status` with `curl -I`; a persistent `DYNAMIC` on
an R2 custom domain usually means a Worker is needed in front.

### Security headers

`next.config.ts` sends HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, and a CSP in
**report-only** mode. CSP is reported, not enforced: `script-src 'self'` would block the inline
theme script, and a nonce would opt the whole app out of static rendering. Enforcing it needs an
inline-script hash or SRI. The same rule set narrows `Access-Control-Allow-Origin` to this site's
origin instead of `*`, so no Proxy is needed for it.

### Language

`siteLang` in `src/config/site.ts` selects `zh_CN`, `en`, or `ja_JP` **at build time**. It sets
`<html lang>`, all UI strings, and date formatting. There is no `/[lang]` route and no runtime
switcher — changing the language means changing the config and rebuilding.

## Layout

Every page renders through `PageShell`, which gives a three-column reading frame:

| Column            | Contents                                                       | Visible from  |
| ----------------- | -------------------------------------------------------------- | ------------- |
| Left (primary)    | profile, announcement, categories, tags, series                | `lg` (1024px) |
| Centre            | the page content, with the footer inside this column           | always        |
| Right (secondary) | site stats, post calendar, table of contents (post pages only) | `xl` (1280px) |

Both sidebars persist across pages because each page renders the shell rather than opting in
individually. Below `xl` the secondary column is dropped rather than squeezed; below `lg` the
primary column goes too. The footer sits inside the centre column, so it aligns to the reading
measure instead of spanning the page.

Set `arrangement: "single"` in `src/config/sidebar.ts` to drop the right-hand column entirely.

## Design

Two daisyUI themes, `paper` (light) and `ink` (dark), tuned for reading CJK text: a warm paper
light background, a soft ink dark background, and a serif CJK body face (LXGW WenKai) with Inter
for Latin. Line length is capped at 42em, roughly 42 CJK characters per line.

There is no theme picker beyond light/dark, and no Material Color tokens. Posts carry no license
block and the footer carries no license line.

## Checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

`pnpm build` must pass with Turbopack. Note that with Cache Components enabled, route segment
options `dynamic`, `revalidate`, `fetchCache` and `runtime` are removed — see the bundled docs in
`node_modules/next/dist/docs/`. Reading cookies therefore needs `export const instant = false`
rather than a segment config.
