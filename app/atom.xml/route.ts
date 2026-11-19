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
  const updated = (posts[0]?.published ?? new Date()).toISOString();

  const entries = posts
    .map((post) => {
      const url = `${base}/posts/${post._meta.path}`;
      const summary = post.passwordProtected
        ? "[protected]"
        : escapeXml(post.description || post.excerpt);

      return `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${escapeXml(url)}" />
    <id>${escapeXml(url)}</id>
    <updated>${post.updated?.toISOString() ?? post.published.toISOString()}</updated>
    <published>${post.published.toISOString()}</published>
    <summary>${summary}</summary>
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteConfig.title)}</title>
  <subtitle>${escapeXml(siteConfig.description)}</subtitle>
  <link href="${escapeXml(`${base}/atom.xml`)}" rel="self" />
  <link href="${escapeXml(base)}" />
  <id>${escapeXml(base)}/</id>
  <updated>${updated}</updated>
  <author><name>${escapeXml(siteConfig.author)}</name></author>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
