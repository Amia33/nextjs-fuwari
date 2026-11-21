import type { Metadata } from "next";

import { siteConfig } from "@/src/config/site";

const BANNER = siteConfig.banner.src;

type PageMeta = {
  /** Omitted means the site title from the root layout's template. */
  title?: string;
  description?: string;
  /** Path used for both the canonical link and `og:url`. */
  path: string;
  type?: "website" | "article";
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
};

/**
 * Every route's metadata, so `rel=canonical` and `og:url` come from one value
 * and can never disagree. Relative paths resolve against `metadataBase` in the
 * root layout.
 *
 * `openGraph` is replaced wholesale, not merged, when a route defines it — that
 * is why the fields are assembled here rather than inherited from the layout.
 *
 * A `noindex` page drops both the canonical and `og:url`: advertising a
 * preferred URL for a page you have asked crawlers not to index is a
 * contradictory signal.
 */
export function pageMetadata(meta: PageMeta): Metadata {
  const title = meta.title ?? siteConfig.title;
  const description = meta.description ?? siteConfig.description;
  const url = meta.path;
  const image = meta.image ?? BANNER;
  const indexed = !meta.noindex;
  const isBanner = image === BANNER;

  return {
    // Omitted rather than set to `undefined`: an explicit `title: undefined`
    // replaces the root layout's `title.default`/`template` and drops the
    // element entirely.
    ...(meta.title ? { title: meta.title } : {}),
    description,
    alternates: indexed ? { canonical: url } : undefined,
    openGraph: {
      type: meta.type ?? "website",
      siteName: siteConfig.title,
      title,
      description,
      url: indexed ? url : undefined,
      // Dimensions are only known for the banner; content covers vary, and a
      // wrong aspect ratio is worse than none.
      images: [
        {
          url: image,
          alt: meta.imageAlt ?? title,
          ...(isBanner ? { width: 1600, height: 900 } : {}),
        },
      ],
      ...(meta.type === "article"
        ? {
            publishedTime: meta.publishedTime,
            modifiedTime: meta.modifiedTime,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: indexed ? undefined : { index: false, follow: false },
  };
}
