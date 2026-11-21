import { getSiteStats } from "@/src/content/stats";
import { formatDate, t } from "@/src/i18n";

import { WidgetLayout } from "./WidgetLayout";

const COUNT = new Intl.NumberFormat("en-US");

export function SiteStatsWidget() {
  const stats = getSiteStats();

  const rows: Array<{ label: string; value: string }> = [
    { label: t("stats.posts"), value: COUNT.format(stats.posts) },
    { label: t("stats.moments"), value: COUNT.format(stats.moments) },
    { label: t("stats.albums"), value: COUNT.format(stats.albums) },
    { label: t("stats.categories"), value: COUNT.format(stats.categories) },
    { label: t("stats.tags"), value: COUNT.format(stats.tags) },
    { label: t("stats.series"), value: COUNT.format(stats.series) },
    { label: t("stats.words"), value: COUNT.format(stats.words) },
  ];

  return (
    <WidgetLayout name={t("stats.title")}>
      <dl className="space-y-1.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline gap-2">
            <dt className="text-muted">{row.label}</dt>
            <span
              aria-hidden="true"
              className="min-w-0 flex-1 border-b border-dotted border-base-300"
            />
            <dd className="tabular-nums text-subtle">{row.value}</dd>
          </div>
        ))}
        {stats.lastActivity ? (
          <div className="flex items-baseline gap-2">
            <dt className="text-muted">{t("stats.updated")}</dt>
            <span
              aria-hidden="true"
              className="min-w-0 flex-1 border-b border-dotted border-base-300"
            />
            <dd className="tabular-nums text-subtle">
              {formatDate(stats.lastActivity)}
            </dd>
          </div>
        ) : null}
      </dl>
    </WidgetLayout>
  );
}
