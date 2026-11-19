import Link from "next/link";

import { CopyButton } from "@/src/components/molecules/CopyButton";
import { getSortedPosts } from "@/src/content/posts";
import { siteConfig } from "@/src/config/site";
import { formatDate, t } from "@/src/i18n";

export function FeedLanding() {
  const base = siteConfig.url.replace(/\/$/, "");
  const recent = getSortedPosts().slice(0, 10);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("feed.title")}
        </h1>
        <p className="mt-1 text-sm opacity-60">{t("feed.description")}</p>
      </header>

      <ul className="space-y-3">
        {[
          {
            label: t("feed.rss"),
            href: "/rss.xml",
            absolute: `${base}/rss.xml`,
          },
          {
            label: t("feed.atom"),
            href: "/atom.xml",
            absolute: `${base}/atom.xml`,
          },
        ].map((feed) => (
          <li
            key={feed.href}
            className="flex items-center justify-between gap-4 rounded-box border border-base-300 p-4"
          >
            <div className="min-w-0">
              <p className="font-medium">{feed.label}</p>
              <Link
                href={feed.href}
                className="block truncate text-xs opacity-60"
              >
                {feed.absolute}
              </Link>
            </div>
            <CopyButton value={feed.absolute} />
          </li>
        ))}
      </ul>

      <h2 className="mb-3 mt-10 text-sm font-medium uppercase tracking-wider opacity-50">
        {t("feed.recent")}
      </h2>
      <ul className="space-y-2 text-sm">
        {recent.map((post) => (
          <li key={post._meta.path} className="flex items-baseline gap-3">
            <time className="shrink-0 text-xs tabular-nums opacity-50">
              {formatDate(post.published)}
            </time>
            <Link
              href={`/posts/${post._meta.path}`}
              transitionTypes={["nav-forward"]}
              className="truncate hover:text-primary"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
