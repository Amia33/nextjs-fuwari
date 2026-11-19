import Link from "next/link";

import type { PublicPost } from "@/src/content/posts";

export function ArchiveList({ posts }: { posts: PublicPost[] }) {
  const byYear = new Map<number, PublicPost[]>();
  for (const post of posts) {
    const year = post.published.getUTCFullYear();
    const group = byYear.get(year) ?? [];
    group.push(post);
    byYear.set(year, group);
  }

  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <div className="space-y-10">
      {years.map((year) => (
        <section key={year}>
          <h2 className="mb-3 text-lg font-semibold tabular-nums opacity-80">
            {year}
          </h2>
          <ul className="space-y-3">
            {(byYear.get(year) ?? []).map((post) => (
              <li key={post._meta.path} className="flex items-baseline gap-3">
                <time
                  dateTime={post.published.toISOString()}
                  className="w-14 shrink-0 text-xs tabular-nums opacity-50"
                >
                  {post.published.toISOString().slice(5, 10).replace("-", "/")}
                </time>
                <Link
                  href={`/posts/${post._meta.path}`}
                  transitionTypes={["nav-forward"]}
                  className="min-w-0 flex-1 truncate text-sm hover:text-primary"
                >
                  {post.title}
                </Link>
                {post.category ? (
                  <span className="hidden shrink-0 text-xs opacity-40 sm:inline">
                    {post.category}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
