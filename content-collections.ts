import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

import { assetUrl, type AssetCollection } from "./src/content/assets";
import { rehypePlugins, remarkPlugins } from "./src/content/pipeline";
import { remarkAssetPaths } from "./src/content/remark-asset-paths";
import { excerptOf, readingTimeOf } from "./src/content/text";

const protection = {
  passwordProtected: z.boolean().default(false),
  passwordHash: z.string().optional(),
  passwordHint: z.string().optional(),
  /**
   * Trap for the old plaintext field. Zod strips unknown keys before
   * `superRefine` runs, so this has to be declared to be rejected. The inner
   * schema always fails, and `.optional()` lets documents that omit it pass.
   */
  password: z
    .string()
    .refine(() => false, {
      message:
        "Plaintext `password:` is not supported. Run `pnpm hash-password` and paste the `passwordHash:` value.",
    })
    .optional(),
};

const gated = <T extends z.ZodRawShape>(shape: T) => {
  const schema = z.object({ ...shape, ...protection });
  return schema.superRefine((doc, ctx) => {
    const record = doc as Record<string, unknown>;
    if (record.passwordProtected === true && !record.passwordHash) {
      ctx.addIssue({
        code: "custom",
        path: ["passwordHash"],
        message: "`passwordProtected: true` requires `passwordHash`.",
      });
    }
  });
};

const taxonomy = {
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
};

/**
 * A protected document must not point at the published copy of any content
 * asset. Those copies exist only for public documents, so depending on one is
 * a leak by construction — and a silent 404 once the sync step stops copying
 * it. Site-wide assets (`/assets/avatar.png`) are unaffected.
 */
function assertNoPublishedRefs(
  collection: AssetCollection,
  slug: string,
  refs: (string | undefined)[],
) {
  for (const ref of refs) {
    if (!ref?.startsWith(`/assets/${collection}/`)) continue;

    const name = ref.slice(ref.lastIndexOf("/") + 1);
    throw new Error(
      `${collection}/${slug}: a password-protected document references "${ref}", ` +
        `which is the published copy of another document's asset. Reference it ` +
        `relatively (e.g. "${name}") so it is served through /vault instead.`,
    );
  }
}

/** Frontmatter asset refs rewritten for this document's namespace. */
function resolveRefs(
  collection: AssetCollection,
  slug: string,
  refs: string[],
  gated: boolean,
): string[] {
  return refs.map((ref) => assetUrl(collection, slug, ref, gated));
}

/** The shared plugin list plus a per-document asset-path rewrite. */
function pluginsFor(collection: AssetCollection, slug: string, gated: boolean) {
  return {
    remarkPlugins: [
      ...remarkPlugins,
      remarkAssetPaths({ collection, slug, gated }),
    ],
    rehypePlugins,
  };
}

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "**/*.mdx",
  schema: gated({
    title: z.string(),
    description: z.string().default(""),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    pinned: z.boolean().default(false),
    image: z.string().optional(),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    lang: z.enum(["zh_CN", "en", "ja_JP"]).optional(),
    ...taxonomy,
    content: z.string(),
  }),
  transform: async (doc, ctx) => {
    const slug = doc._meta.path;
    const gated = doc.passwordProtected === true;
    if (gated) assertNoPublishedRefs("posts", slug, [doc.image]);

    const { words, minutes } = readingTimeOf(doc.content);
    return {
      ...doc,
      image: doc.image
        ? resolveRefs("posts", slug, [doc.image], gated)[0]
        : undefined,
      mdx: await compileMDX(ctx, doc, pluginsFor("posts", slug, gated)),
      words,
      minutes,
      excerpt: excerptOf(doc.content),
    };
  },
});

const moments = defineCollection({
  name: "moments",
  directory: "content/moments",
  include: "**/*.mdx",
  schema: gated({
    published: z.coerce.date(),
    /**
     * A bare path still works; the object form adds alt text, which a moment
     * photo needs because each one is a standalone link to the full-size image.
     */
    images: z
      .array(
        z.union([
          z.string(),
          z.object({ src: z.string(), alt: z.string().default("") }),
        ]),
      )
      .default([]),
    location: z.string().optional(),
    mood: z.string().optional(),
    content: z.string(),
  }),
  transform: async (doc, ctx) => {
    const slug = doc._meta.path;
    const gated = doc.passwordProtected === true;
    const images = doc.images.map((image) =>
      typeof image === "string" ? { src: image, alt: "" } : image,
    );
    if (gated)
      assertNoPublishedRefs(
        "moments",
        slug,
        images.map((i) => i.src),
      );

    return {
      ...doc,
      images: images.map((image) => ({
        ...image,
        src: resolveRefs("moments", slug, [image.src], gated)[0],
      })),
      mdx: await compileMDX(ctx, doc, pluginsFor("moments", slug, gated)),
    };
  },
});

const albums = defineCollection({
  name: "albums",
  directory: "content/albums",
  include: "**/*.mdx",
  schema: gated({
    title: z.string(),
    description: z.string().default(""),
    published: z.coerce.date(),
    cover: z.string().optional(),
    photos: z
      .array(z.object({ src: z.string(), alt: z.string().default("") }))
      .default([]),
    content: z.string(),
  }),
  transform: async (doc, ctx) => {
    const slug = doc._meta.path;
    const gated = doc.passwordProtected === true;
    if (gated) {
      assertNoPublishedRefs("albums", slug, [
        doc.cover,
        ...doc.photos.map((photo) => photo.src),
      ]);
    }

    return {
      ...doc,
      cover: doc.cover
        ? resolveRefs("albums", slug, [doc.cover], gated)[0]
        : undefined,
      photos: doc.photos.map((photo) => ({
        ...photo,
        src: resolveRefs("albums", slug, [photo.src], gated)[0],
      })),
      mdx: await compileMDX(ctx, doc, pluginsFor("albums", slug, gated)),
    };
  },
});

const series = defineCollection({
  name: "series",
  directory: "content/series",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string().default(""),
    content: z.string(),
  }),
  transform: async (doc, ctx) => ({
    ...doc,
    mdx: await compileMDX(ctx, doc, { remarkPlugins, rehypePlugins }),
  }),
});

const spec = defineCollection({
  name: "spec",
  directory: "content/spec",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    content: z.string(),
  }),
  transform: async (doc, ctx) => ({
    ...doc,
    mdx: await compileMDX(ctx, doc, { remarkPlugins, rehypePlugins }),
  }),
});

export default defineConfig({
  content: [posts, moments, albums, series, spec],
  hooks: {
    writer: [
      ({ content, fileType }) =>
        fileType === "javascript"
          ? { content: `import "server-only";\n\n${content}` }
          : { content },
    ],
  },
});
