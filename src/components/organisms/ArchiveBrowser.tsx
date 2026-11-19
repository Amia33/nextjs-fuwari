"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { t } from "@/src/i18n";

import { ArchiveList, type ArchivePost } from "./ArchiveList";

/**
 * Archive filtering on the client, so the route itself stays static.
 *
 * `searchParams` is request-time data, so a server-side read makes every
 * `/archive?tag=…` a fresh server render. Reading it in the browser instead
 * keeps one prerendered `/archive` for every filter URL — the filter costs no
 * invocation at all. Upstream does the same, reading `location.search` on mount.
 *
 * The unfiltered list is passed in whole; filtering 16 posts in the browser is
 * cheaper than any server round trip.
 */
export function ArchiveBrowser({ posts }: { posts: ArchivePost[] }) {
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag");
  const category = searchParams.get("category");

  const visible = tag
    ? posts.filter((post) => post.tags.includes(tag))
    : category
      ? posts.filter((post) => (post.category ?? "") === category)
      : posts;

  const label = tag
    ? `${t("archive.filteredByTag")}：${tag}`
    : category
      ? `${t("archive.filteredByCategory")}：${category}`
      : null;

  return (
    <>
      {label ? (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link href="/archive" className="btn btn-ghost btn-xs">
            {t("archive.clear")}
          </Link>
          <span className="text-sm opacity-70">{label}</span>
        </div>
      ) : null}

      <ArchiveList posts={visible} />
    </>
  );
}
