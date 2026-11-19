import type { MetadataRoute } from "next";

import { getAlbums } from "@/src/content/albums";
import { getSortedPosts } from "@/src/content/posts";
import { siteConfig } from "@/src/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");

  const staticRoutes = [
    "",
    "/archive",
    "/categories",
    "/tags",
    "/series",
    "/moments",
    "/albums",
    "/timeline",
    "/about",
  ].map((path) => ({
    url: `${base}${path}`,
  }));

  const posts = getSortedPosts()
    .filter((post) => !post.passwordProtected)
    .map((post) => ({
      url: `${base}/posts/${post._meta.path}`,
      lastModified: post.updated ?? post.published,
    }));

  const albums = getAlbums()
    .filter((album) => !album.passwordProtected)
    .map((album) => ({
      url: `${base}/albums/${album._meta.path}`,
      lastModified: album.published,
    }));

  return [...staticRoutes, ...posts, ...albums];
}
