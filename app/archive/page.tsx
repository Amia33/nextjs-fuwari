import { Suspense } from "react";

import { ArchiveBrowser } from "@/src/components/organisms/ArchiveBrowser";
import {
  ArchiveList,
  type ArchivePost,
} from "@/src/components/organisms/ArchiveList";
import { PageShell } from "@/src/components/organisms/PageShell";
import { getSortedPosts } from "@/src/content/posts";
import { t } from "@/src/i18n";

/**
 * The archive is one fully static page for every filter URL.
 *
 * Filtering used to read `searchParams` here, which is request-time data and
 * kept the whole route dynamic (`ƒ`) — every `/archive?tag=…` was a fresh server
 * render. The filter now runs in the browser instead, so `?tag=` and
 * `?category=` reuse this prerendered HTML and cost no invocation.
 *
 * `ArchiveBrowser` reads the query string with `useSearchParams`, which forces
 * the nearest `<Suspense>` boundary to render on the client. Prerendering emits
 * the unfiltered list as its fallback, so the page is complete before hydration.
 *
 * Posts are projected to the handful of fields the list renders. `PublicPost`
 * also carries raw markdown and compiled MDX, which must not be serialized into
 * a Client Component's payload.
 */
export const ensureStatic = "navigation";

export const metadata = { title: t("archive.title") };

export default function ArchivePage() {
  const posts: ArchivePost[] = getSortedPosts().map((post) => ({
    path: post._meta.path,
    title: post.title,
    published: post.published,
    category: post.category,
    tags: post.tags,
  }));

  return (
    <PageShell
      page="archive"
      bannerTitle={t("archive.title")}
      bannerDescription={t("archive.description")}
    >
      <Suspense fallback={<ArchiveList posts={posts} />}>
        <ArchiveBrowser posts={posts} />
      </Suspense>
    </PageShell>
  );
}
