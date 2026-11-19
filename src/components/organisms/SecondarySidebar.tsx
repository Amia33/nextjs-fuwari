import type { ReactNode } from "react";

import { getCalendarData } from "@/src/content/calendar";
import { t } from "@/src/i18n";

import { CalendarWidget } from "../widgets/CalendarWidget";
import { SiteStatsWidget } from "../widgets/SiteStatsWidget";

/**
 * Right column: the post calendar always, plus the site-stats summary on the
 * index only (elsewhere it is the same numbers on every page, which is noise),
 * and the table of contents on post pages.
 *
 * Only visible from `xl` up; below that the grid degrades to a single sidebar,
 * matching the upstream arrangement.
 */
export function SecondarySidebar({
  toc,
  showStats = false,
}: {
  toc?: ReactNode;
  /** Site stats are an index-page widget. */
  showStats?: boolean;
}) {
  const { postsByDate, initialMonth } = getCalendarData();

  return (
    <aside aria-label={t("sidebar.secondary")} className="hidden xl:block">
      <div className="sticky top-20 space-y-4">
        {showStats ? <SiteStatsWidget /> : null}
        <CalendarWidget postsByDate={postsByDate} initialMonth={initialMonth} />
        {toc}
      </div>
    </aside>
  );
}
