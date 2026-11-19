/**
 * Which widgets render in which column, and on which pages.
 *
 * Mirrors the upstream Shirone arrangement (dual columns, primary on the left)
 * without the runtime page-filter machinery: in the App Router each page simply
 * renders the widgets it wants, and the shared columns come from
 * `app/layout.tsx`.
 */
export const sidebarConfig = {
  /** `dual` shows both columns at ≥1280px; `single` shows only the primary. */
  arrangement: "dual" as "single" | "dual",
  /** Physical side of the primary column; the secondary takes the other. */
  side: "left" as "left" | "right",
  collapseAfter: {
    categories: 5,
    tags: 12,
    series: 5,
  },
  announcementPages: ["home"] as string[],
} as const;
