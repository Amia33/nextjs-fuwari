import Link from "next/link";

import { ArchiveList } from "@/src/components/organisms/ArchiveList";
import { PageShell } from "@/src/components/organisms/PageShell";
import {
  getPostsByCategory,
  getPostsByTag,
  getSortedPosts,
} from "@/src/content/posts";
import { t } from "@/src/i18n";

type Props = PageProps<"/archive">;

// Filtering reads `searchParams`, which is request data — the route cannot be
// fully prerendered without a Suspense boundary around it.
export const instant = false;

export const metadata = { title: t("archive.title") };

export default async function ArchivePage({ searchParams }: Props) {
  const { tag, category } = await searchParams;
  const tagValue = typeof tag === "string" ? tag : undefined;
  const categoryValue = typeof category === "string" ? category : undefined;

  let posts = getSortedPosts();
  let label = t("archive.description");

  if (tagValue) {
    posts = getPostsByTag(tagValue);
    label = `${t("archive.filteredByTag")}：${tagValue}`;
  } else if (categoryValue) {
    posts = getPostsByCategory(categoryValue);
    label = `${t("archive.filteredByCategory")}：${categoryValue}`;
  }

  return (
    <PageShell page="archive">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("archive.title")}
        </h1>
        <p className="mt-1 text-sm opacity-60">{label}</p>
        {tagValue || categoryValue ? (
          <Link href="/archive" className="btn btn-ghost btn-xs mt-3">
            {t("archive.clear")}
          </Link>
        ) : null}
      </header>

      <ArchiveList posts={posts} />
    </PageShell>
  );
}
