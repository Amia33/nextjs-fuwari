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
| `<Video src="/media/clip.mp4" poster="…" title="…" />`            | local video via video.js v10                   |
| `<Audio src="/media/clip.mp3" title="…" />`                       | local audio                                    |

Media are local asset paths only. Iframe embeds are not supported anywhere in the project.

Admonitions are **authored as components**, not derived from markdown syntax. GitHub-style
`> [!NOTE]` blockquotes render as ordinary blockquotes by design.

## Password-protected content

Posts, moments and albums can be gated. Only a hash is ever stored:

The repository ships three working examples: `content/posts/private-note.mdx`,
`content/moments/2026-11-17-unfinished.mdx`, and `content/albums/private-album.mdx` (passwords
`secret123`, `moment-pass`, and `album-pass` respectively — fixtures for local testing only;
delete them before publishing).

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

Unlocking sets an HttpOnly, SameSite=Lax cookie scoped to that one item, valid for 7 days.
Verification is server-side; protected bodies never appear in the prerendered HTML, the RSC
payload, the sitemap, or any other generated feed.

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
options `dynamic`, `revalidate` and `fetchCache` are removed — see the bundled docs in
`node_modules/next/dist/docs/`.
