import { Banner } from "@/src/components/organisms/Banner";
import { Sidebar } from "@/src/components/organisms/Sidebar";
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
      <Banner />
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex gap-8 py-10">
          <main className="min-w-0 flex-1">
            <PostList posts={posts} />
            <Pagination page={page} totalPages={totalPages} />
          </main>
          <Sidebar />
        </div>
      </div>
      <PhotoSwipeProvider />
    </>
  );
}
