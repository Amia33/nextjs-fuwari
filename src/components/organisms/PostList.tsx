import type { PublicPost } from "@/src/content/posts";
import { t } from "@/src/i18n";

import { PostCard } from "@/src/components/molecules/PostCard";

export function PostList({ posts }: { posts: PublicPost[] }) {
  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-subtle">{t("post.empty")}</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3 sm:gap-0 sm:divide-y sm:divide-base-300">
      {posts.map((post, index) => (
        <PostCard key={post._meta.path} post={post} index={index} />
      ))}
    </ul>
  );
}
