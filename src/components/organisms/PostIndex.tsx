import { Pagination } from "@/src/components/molecules/Pagination";
import { PageShell } from "@/src/components/organisms/PageShell";
import { PhotoSwipeProvider } from "@/src/components/organisms/PhotoSwipeProvider";
import { PostList } from "@/src/components/organisms/PostList";
import { getPaginatedPosts } from "@/src/content/posts";
import { postListConfig } from "@/src/config/post-list";
import { siteConfig } from "@/src/config/site";

/**
 * The paginated post index, shared by `/` and `/page/N`.
 *
 * Both routes render this so `/page/1` is byte-identical to the home index —
 * which is what lets the `/page/[page]` route point its canonical at `/` for
 * page 1.
 */
export function PostIndex({ page }: { page: number }) {
  const { posts, totalPages } = getPaginatedPosts(
    page,
    postListConfig.pageSize,
  );
  const home = page === 1;

  return (
    <>
      <PageShell
        page="home"
        wide
        home={home}
        stats
        bannerTitle={home ? undefined : siteConfig.title}
        bannerDescription={home ? undefined : siteConfig.subtitle}
      >
        <PostList posts={posts} />
        <Pagination page={page} totalPages={totalPages} />
      </PageShell>
      <PhotoSwipeProvider />
    </>
  );
}
