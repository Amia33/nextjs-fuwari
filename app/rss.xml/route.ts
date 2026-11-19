import { getSortedPosts } from "@/src/content/posts";
import { siteConfig } from "@/src/config/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = getSortedPosts().slice(0, 20);
  const base = siteConfig.url.replace(/\/$/, "");

  const items = posts
    .map((post) => {
      const url = `${base}/posts/${post._meta.path}`;
      const description = post.passwordProtected
        ? "[protected]"
        : escapeXml(post.description || post.excerpt);

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid>${escapeXml(url)}</guid>
      <pubDate>${post.published.toUTCString()}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${siteConfig.lang}</language>
    <atom:link href="${escapeXml(`${base}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
