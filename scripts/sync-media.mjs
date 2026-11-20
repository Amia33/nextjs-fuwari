#!/usr/bin/env node
/**
 * Copies public documents' colocated assets into `public/assets/`, so the CDN
 * can serve them. Protected documents are skipped on purpose: their files stay
 * in `content/` and are only reachable through the `/vault` route.
 *
 * Runs before `dev` and `build`. It prunes its own output first, so renaming a
 * slug or un-protecting a document can never leave a stale copy behind.
 */
import { cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");
const OUTPUT = join(ROOT, "public", "assets");
const COLLECTIONS = ["posts", "moments", "albums"];

const MEDIA = /\.(?:jpe?g|png|webp|avif|gif|svg|mp4|webm|mp3|ogg|m4a|wav)$/i;

/** Reads the YAML frontmatter block without pulling in a YAML dependency. */
async function frontmatter(file) {
  const source = await readFile(file, "utf8");
  return /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? "";
}

function isProtected(yaml) {
  return /^passwordProtected:\s*true\s*$/m.test(yaml);
}

/** Relative asset names a document uses: its siblings on disk. */
async function assetsOf(directory, entries) {
  const files = [];
  for (const entry of entries) {
    if (!MEDIA.test(entry)) continue;
    const full = join(directory, entry);
    const info = await stat(full);
    if (info.isFile()) files.push(entry);
  }
  return files;
}

async function main() {
  for (const collection of COLLECTIONS) {
    await rm(join(OUTPUT, collection), { recursive: true, force: true });
  }

  let copied = 0;

  for (const collection of COLLECTIONS) {
    const collectionDir = join(CONTENT, collection);
    let slugs;
    try {
      slugs = await readdir(collectionDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const slugEntry of slugs) {
      if (!slugEntry.isDirectory()) continue;
      const slug = slugEntry.name;
      const directory = join(collectionDir, slug);

      const index = join(directory, "index.mdx");
      let entries;
      try {
        entries = await readdir(directory);
      } catch {
        continue;
      }
      if (!entries.includes("index.mdx")) continue;

      const yaml = await frontmatter(index);
      const protectedDoc = isProtected(yaml);
      const assets = await assetsOf(directory, entries);

      for (const asset of assets) {
        // A protected document's assets are only reachable through /vault, which
        // checks the unlock cookie. Copying them here would publish them.
        if (protectedDoc) continue;

        const target = join(OUTPUT, collection, slug, asset);
        await mkdir(dirname(target), { recursive: true });
        await cp(join(directory, asset), target);
        copied += 1;
      }
    }
  }

  if (copied > 0) {
    console.log(
      `[sync-media] copied ${copied} public asset(s) to public/assets`,
    );
  }
}

main().catch((error) => {
  console.error("[sync-media]", error);
  process.exit(1);
});
