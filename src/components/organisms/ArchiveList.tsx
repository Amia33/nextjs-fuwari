import Link from "next/link";

import { t } from "@/src/i18n";

/**
 * The few fields the archive list renders. Deliberately narrower than
 * `PublicPost`: the archive browser is a Client Component, and passing whole
 * posts would serialize every compiled MDX body into the page payload.
 */
export type ArchivePost = {
  path: string;
  title: string;
  published: Date;
  category?: string;
  /** Kept for the browser-side tag filter. */
  tags: string[];
};

export function ArchiveList({ posts }: { posts: ArchivePost[] }) {
  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-subtle">
        {t("archive.empty")}
      </p>
    );
  }

  const byYear = new Map<number, ArchivePost[]>();
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
          <h2 className="mb-3 text-lg font-semibold tabular-nums text-muted">
            {year}
          </h2>
          <ul className="space-y-3">
            {(byYear.get(year) ?? []).map((post) => (
              <li key={post.path} className="flex items-baseline gap-3">
                <time
                  dateTime={post.published.toISOString()}
                  className="w-14 shrink-0 text-xs tabular-nums text-subtle"
                >
                  {post.published.toISOString().slice(5, 10).replace("-", "/")}
                </time>
                <Link
                  href={`/posts/${post.path}`}
                  transitionTypes={["nav-forward"]}
                  className="min-w-0 flex-1 truncate text-sm hover:text-primary"
                >
                  {post.title}
                </Link>
                {post.category ? (
                  <span className="hidden shrink-0 text-xs text-subtle sm:inline">
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
