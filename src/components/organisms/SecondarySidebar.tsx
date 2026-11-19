import type { ReactNode } from "react";

import { getCalendarData } from "@/src/content/calendar";
import { t } from "@/src/i18n";

import { CalendarWidget } from "../widgets/CalendarWidget";
import { SiteStatsWidget } from "../widgets/SiteStatsWidget";

/**
 * Right column: site stats, the post calendar, and — on post pages — the table
 * of contents. Only visible from `xl` up; below that the grid degrades to a
 * single sidebar, matching the upstream arrangement.
 */
export function SecondarySidebar({ toc }: { toc?: ReactNode }) {
  const { postsByDate, initialMonth } = getCalendarData();

  return (
    <aside
      aria-label={t("sidebar.secondary")}
      className="hidden w-[17.5rem] shrink-0 xl:block"
    >
      <div className="sticky top-20 space-y-4">
        <SiteStatsWidget />
        <CalendarWidget postsByDate={postsByDate} initialMonth={initialMonth} />
        {toc}
      </div>
    </aside>
  );
}
