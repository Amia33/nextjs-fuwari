export const en = {
  "nav.home": "Home",
  "nav.archive": "Archive",
  "nav.categories": "Categories",
  "nav.tags": "Tags",
  "nav.series": "Series",
  "nav.moments": "Moments",
  "nav.albums": "Albums",
  "nav.timeline": "Timeline",
  "nav.about": "About",
  "nav.theme": "Toggle theme",
  "nav.menu": "Menu",

  "post.published": "Published",
  "post.updated": "Updated",
  "post.updatedAgo": "updated {span} after publishing",
  "post.readingTime": "{minutes} min read",
  "post.words": "{count} words",
  "post.tags": "Tags",
  "post.category": "Category",
  "post.prev": "Previous",
  "post.next": "Next",
  "post.toc": "On this page",
  "post.pinned": "Pinned",
  "post.protected": "Protected",
  "post.empty": "No posts yet.",
  "post.notFound": "Post not found.",

  "list.page": "Page {page}",
  "list.prevPage": "Previous page",
  "list.nextPage": "Next page",

  "archive.title": "Archive",
  "archive.description": "Every post, newest first.",
  "archive.all": "All",
  "archive.uncategorized": "Uncategorized",
  "archive.filteredByTag": "Filtered by tag",
  "archive.filteredByCategory": "Filtered by category",
  "archive.clear": "Clear filter",

  "categories.title": "Categories",
  "categories.description": "Posts grouped by category.",
  "categories.count": "{count} posts",

  "tags.title": "Tags",
  "tags.description": "Posts grouped by tag.",
  "tags.count": "{count} posts",

  "series.title": "Series",
  "series.description": "Longer writings, collected.",
  "series.posts": "{count} posts",

  "moments.title": "Moments",
  "moments.description": "Short notes, as they happen.",
  "moments.empty": "No moments yet.",

  "albums.title": "Albums",
  "albums.description": "Photographs, collected.",
  "albums.empty": "No albums yet.",
  "albums.photos": "{count} photos",

  "timeline.title": "Timeline",
  "timeline.description": "A life in dates.",

  "about.title": "About",

  "gate.title": "This content is protected",
  "gate.description": "Enter the password to read it.",
  "gate.hint": "Hint",
  "gate.placeholder": "Password",
  "gate.submit": "Unlock",
  "gate.submitting": "Checking…",
  "gate.wrong": "Incorrect password.",
  "gate.throttled": "Too many attempts. Try again later.",

  "announcement.title": "Announcement",
  "announcement.close": "Dismiss announcement",

  "stats.title": "Site stats",
  "stats.posts": "Posts",
  "stats.moments": "Moments",
  "stats.albums": "Albums",
  "stats.categories": "Categories",
  "stats.tags": "Tags",
  "stats.series": "Series",
  "stats.words": "Words",
  "stats.updated": "Updated",

  "calendar.title": "Calendar",
  "calendar.prevMonth": "Previous month",
  "calendar.nextMonth": "Next month",
  "calendar.today": "Back to today",
  "calendar.noPosts": "No posts this day",

  "sidebar.primary": "Sidebar",
  "sidebar.secondary": "Supplementary sidebar",

  "footer.poweredBy": "Built with Next.js",

  "notFound.title": "Page not found",
  "notFound.description": "The page you were looking for does not exist.",
  "notFound.back": "Back home",

  "common.loading": "Loading…",
} as const;

export type I18nKey = keyof typeof en;
export type Dictionary = Record<I18nKey, string>;
