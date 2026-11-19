import { getSortedPosts } from "@/src/content/posts";
import { siteConfig } from "@/src/config/site";

export function GET() {
  const posts = getSortedPosts();
  const base = siteConfig.url.replace(/\/$/, "");

  const lines = posts.map((post) => {
    const url = `${base}/posts/${post._meta.path}`;
    const summary = post.passwordProtected
      ? "[protected]"
      : post.description || post.excerpt;
    return `- [${post.title}](${url}): ${summary}`;
  });

  const body = `# ${siteConfig.title}

> ${siteConfig.description}

## Posts

${lines.join("\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
