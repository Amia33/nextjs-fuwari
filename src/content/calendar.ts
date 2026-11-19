import { getSortedPosts } from "@/src/content/posts";
import { formatDateIso } from "@/src/i18n";

export type CalendarPost = {
  title: string;
  href: string;
  date: string;
};

export type CalendarData = {
  /** `YYYY-MM-DD` → posts published that day, newest first. */
  postsByDate: Record<string, CalendarPost[]>;
  /** Months containing at least one post, ascending (`YYYY-MM`). */
  activeMonths: string[];
  /** Newest month with a post, or `undefined` when there are none. */
  initialMonth?: string;
};

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function getCalendarData(): CalendarData {
  const postsByDate: Record<string, CalendarPost[]> = {};
  const activeMonthSet = new Set<string>();

  for (const post of getSortedPosts()) {
    const date = formatDateIso(post.published);
    if (!DAY_KEY.test(date)) continue;

    const bucket = postsByDate[date] ?? [];
    bucket.push({
      title: post.title,
      href: `/posts/${post._meta.path}`,
      date,
    });
    postsByDate[date] = bucket;
    activeMonthSet.add(date.slice(0, 7));
  }

  const activeMonths = [...activeMonthSet].sort();
  const initialMonth = activeMonths.at(-1);

  return { postsByDate, activeMonths, initialMonth };
}
