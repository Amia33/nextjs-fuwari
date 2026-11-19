import type { PublicPost } from "@/src/content/posts";
import { t } from "@/src/i18n";

import { PostCard } from "@/src/components/molecules/PostCard";

export function PostList({ posts }: { posts: PublicPost[] }) {
  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-sm opacity-60">{t("post.empty")}</p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 max-[359px]:grid-cols-1 sm:grid-cols-1 sm:gap-0 sm:divide-y sm:divide-base-300">
      {posts.map((post, index) => (
        <PostCard key={post._meta.path} post={post} index={index} />
      ))}
    </ul>
  );
}
