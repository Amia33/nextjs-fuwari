import Link from "next/link";

import { getSeriesList } from "@/src/content/posts";
import { PageShell } from "@/src/components/organisms/PageShell";
import { t } from "@/src/i18n";

export const metadata = { title: t("series.title") };

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
              <span className="ml-2 text-xs opacity-50">
                {t("series.posts", { count: group.posts.length })}
              </span>
            </summary>
            <div className="collapse-content">
              <ol className="space-y-2 text-sm">
                {group.posts.map((post) => (
                  <li key={post._meta.path}>
                    <Link
                      href={`/posts/${post._meta.path}`}
                      transitionTypes={["nav-forward"]}
                      className="hover:text-primary"
                    >
                      {post.title}
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
