import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

import { rehypePlugins, remarkPlugins } from "./src/content/pipeline";
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
    const { words, minutes } = readingTimeOf(doc.content);
    return {
      ...doc,
      mdx: await compileMDX(ctx, doc, { remarkPlugins, rehypePlugins }),
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
    images: z.array(z.string()).default([]),
    location: z.string().optional(),
    mood: z.string().optional(),
    content: z.string(),
  }),
  transform: async (doc, ctx) => ({
    ...doc,
    mdx: await compileMDX(ctx, doc, { remarkPlugins, rehypePlugins }),
  }),
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
  transform: async (doc, ctx) => ({
    ...doc,
    mdx: await compileMDX(ctx, doc, { remarkPlugins, rehypePlugins }),
  }),
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
