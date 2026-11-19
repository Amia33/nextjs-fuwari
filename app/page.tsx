import { PageShell } from "@/src/components/organisms/PageShell";
import { PostList } from "@/src/components/organisms/PostList";
import { Pagination } from "@/src/components/molecules/Pagination";
import { PhotoSwipeProvider } from "@/src/components/organisms/PhotoSwipeProvider";
import { getPaginatedPosts } from "@/src/content/posts";
import { postListConfig } from "@/src/config/post-list";

export default function HomePage() {
  const { posts, page, totalPages } = getPaginatedPosts(
    1,
    postListConfig.pageSize,
  );

  return (
    <>
      <PageShell page="home" wide home>
        <PostList posts={posts} />
        <Pagination page={page} totalPages={totalPages} />
      </PageShell>
      <PhotoSwipeProvider />
    </>
  );
}
