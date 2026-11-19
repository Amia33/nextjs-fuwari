import { allPosts, type Post } from "content-collections";

export type { Post };

export type PublicPost = Omit<Post, "passwordHash">;

/**
 * Drops the password hash before anything leaves this module, so a client
 * component can never receive it. `getGate()` in `src/server/auth/gate.ts` is
 * the only reader of the hash.
 */
function toPublic({ passwordHash: _passwordHash, ...rest }: Post): PublicPost {
  return rest;
}

function isVisible(post: Post): boolean {
  return !post.draft;
}

export function getCollection(): PublicPost[] {
  return allPosts.filter(isVisible).map(toPublic);
}

export function getSortedPosts(): PublicPost[] {
  return [...getCollection()].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const delta = b.published.getTime() - a.published.getTime();
    if (delta !== 0) return delta;
    return a._meta.path.localeCompare(b._meta.path);
  });
}

export function getPostBySlug(slug: string): PublicPost | undefined {
  return getCollection().find((post) => post._meta.path === slug);
}

export function getPaginatedPosts(page: number, size: number) {
  const posts = getSortedPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / size));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * size;
  return {
    posts: posts.slice(start, start + size),
    page: current,
    totalPages,
    total: posts.length,
  };
}

export function getPrevNext(slug: string) {
  const posts = getSortedPosts();
  const index = posts.findIndex((post) => post._meta.path === slug);
  if (index === -1) return { prev: undefined, next: undefined };
  return {
    prev: index < posts.length - 1 ? posts[index + 1] : undefined,
    next: index > 0 ? posts[index - 1] : undefined,
  };
}

export function getTagList() {
  const counts = new Map<string, number>();
  for (const post of getCollection()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getCategoryList() {
  const counts = new Map<string, number>();
  for (const post of getCollection()) {
    const category = post.category ?? "";
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getPostsByTag(tag: string): PublicPost[] {
  return getSortedPosts().filter((post) => post.tags.includes(tag));
}

export function getPostsByCategory(category: string): PublicPost[] {
  return getSortedPosts().filter((post) => (post.category ?? "") === category);
}

export function getSeriesList() {
  const groups = new Map<string, PublicPost[]>();
  for (const post of getSortedPosts()) {
    if (!post.series) continue;
    const group = groups.get(post.series) ?? [];
    group.push(post);
    groups.set(post.series, group);
  }
  return [...groups.entries()]
    .map(([name, posts]) => ({
      name,
      posts: [...posts].sort(
        (a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getPostsBySeries(name: string): PublicPost[] {
  return getSeriesList().find((group) => group.name === name)?.posts ?? [];
}
