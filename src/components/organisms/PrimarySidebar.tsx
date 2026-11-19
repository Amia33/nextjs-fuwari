import { sidebarConfig } from "@/src/config/sidebar";
import { t } from "@/src/i18n";

import { AnnouncementWidget } from "../widgets/AnnouncementWidget";
import { CategoriesWidget } from "../widgets/CategoriesWidget";
import { ProfileWidget } from "../widgets/ProfileWidget";
import { SeriesWidget } from "../widgets/SeriesWidget";
import { TagsWidget } from "../widgets/TagsWidget";

export function PrimarySidebar({ page }: { page?: string }) {
  const showAnnouncement =
    sidebarConfig.announcementPages.includes("home") &&
    (page === "home" || page === undefined);

  return (
    <aside aria-label={t("sidebar.primary")} className="hidden lg:block">
      <div className="sticky top-20 space-y-4">
        <ProfileWidget />
        {showAnnouncement ? <AnnouncementWidget /> : null}
        <CategoriesWidget
          collapseAfter={sidebarConfig.collapseAfter.categories}
        />
        <TagsWidget collapseAfter={sidebarConfig.collapseAfter.tags} />
        <SeriesWidget collapseAfter={sidebarConfig.collapseAfter.series} />
      </div>
    </aside>
  );
}
