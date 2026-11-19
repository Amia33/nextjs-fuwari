import { getAlbums } from "@/src/content/albums";
import { getMoments } from "@/src/content/moments";
import {
  getCategoryList,
  getSeriesList,
  getSortedPosts,
  getTagList,
} from "@/src/content/posts";

export type SiteStats = {
  posts: number;
  moments: number;
  albums: number;
  categories: number;
  tags: number;
  series: number;
  words: number;
  lastActivity?: Date;
};

export function getSiteStats(): SiteStats {
  const posts = getSortedPosts();
  const lastActivity = posts.reduce<Date | undefined>((latest, post) => {
    const candidate = post.updated ?? post.published;
    return !latest || candidate > latest ? candidate : latest;
  }, undefined);

  return {
    posts: posts.length,
    moments: getMoments().length,
    albums: getAlbums().length,
    categories: getCategoryList().filter((item) => item.name).length,
    tags: getTagList().length,
    series: getSeriesList().length,
    words: posts.reduce((total, post) => total + post.words, 0),
    lastActivity,
  };
}
