import { notFound } from "next/navigation";

import { Pagination } from "@/src/components/molecules/Pagination";
import { PageShell } from "@/src/components/organisms/PageShell";
import { PostList } from "@/src/components/organisms/PostList";
import { getPaginatedPosts } from "@/src/content/posts";
import { postListConfig } from "@/src/config/post-list";
import { siteConfig } from "@/src/config/site";

type Props = PageProps<"/page/[page]">;

/**
 * Page 2 and beyond are prerendered in full, exactly like the home index: the
 * posts come from build-time content and the only URL data is `params`, which
 * `generateStaticParams()` enumerates. Requiring static output keeps it that
 * way, and stops any future invalidation from turning the route into a 500 —
 * awaiting `params` outside `<Suspense>` bails on regeneration.
 */
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const { totalPages } = getPaginatedPosts(1, postListConfig.pageSize);
  // Cache Components requires a non-empty result. With a single page of posts
  // there is no /page/N route to build, so emit the first real one.
  if (totalPages <= 1) return [{ page: "2" }];
  return Array.from({ length: totalPages - 1 }, (_, index) => ({
    page: String(index + 2),
  }));
}

export default async function PageNumber({ params }: Props) {
  const { page: rawPage } = await params;
  const pageNumber = Number(rawPage);
  if (!Number.isInteger(pageNumber) || pageNumber < 2) notFound();

  const { posts, page, totalPages } = getPaginatedPosts(
    pageNumber,
    postListConfig.pageSize,
  );
  if (posts.length === 0) notFound();

  return (
    <PageShell
      page="home"
      wide
      stats
      bannerTitle={siteConfig.title}
      bannerDescription={siteConfig.subtitle}
    >
      <PostList posts={posts} />
      <Pagination page={page} totalPages={totalPages} />
    </PageShell>
  );
}
