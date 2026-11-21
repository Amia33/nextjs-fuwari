import Link from "next/link";

import { getSeriesList } from "@/src/content/posts";
import { PageShell } from "@/src/components/organisms/PageShell";
import { t } from "@/src/i18n";
import { pageMetadata } from "@/src/lib/metadata";

export const metadata = pageMetadata({
  path: "/series",
  title: t("series.title"),
  description: t("series.description"),
});

export default function SeriesPage() {
  const series = getSeriesList();

  return (
    <PageShell
      page="series"
      bannerTitle={t("series.title")}
      bannerDescription={t("series.description")}
    >
      <div className="space-y-3">
        {series.map((group) => (
          <details
            key={group.name}
            className="collapse collapse-arrow border border-base-300 bg-base-100"
          >
            <summary className="collapse-title cursor-pointer font-medium">
              {group.name}
              <span className="ml-2 text-xs text-subtle">
                {t("series.posts", { count: group.posts.length })}
              </span>
            </summary>
            <div className="collapse-content">
              {/* Positional numbering, matching the series detail page: the
                  posts are already ordered by `seriesOrder`. */}
              <ol className="space-y-2 text-sm">
                {group.posts.map((post, postIndex) => (
                  <li key={post._meta.path}>
                    <Link
                      href={`/posts/${post._meta.path}`}
                      transitionTypes={["nav-forward"]}
                      className="flex items-baseline gap-3 hover:text-primary"
                    >
                      <span
                        aria-hidden="true"
                        className="text-xs font-medium tabular-nums text-subtle"
                      >
                        {String(postIndex + 1).padStart(2, "0")}
                      </span>
                      <span>{post.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
