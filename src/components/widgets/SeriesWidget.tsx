import Link from "next/link";

import { getSeriesList } from "@/src/content/posts";
import { t } from "@/src/i18n";

import { WidgetLayout } from "./WidgetLayout";

export function SeriesWidget({
  collapseAfter = 5,
}: {
  collapseAfter?: number;
}) {
  const series = getSeriesList();
  if (series.length === 0) return null;

  const visible = series.slice(0, collapseAfter);
  const overflow = series.slice(collapseAfter);

  const list = (items: typeof series) => (
    <ul className="space-y-1 text-sm">
      {items.map((item) => (
        <li key={item.name}>
          <Link
            href={`/series/${encodeURIComponent(item.name)}`}
            transitionTypes={["nav-forward"]}
            className="flex justify-between rounded px-1 py-0.5 hover:bg-base-200"
          >
            <span className="truncate">{item.name}</span>
            <span className="tabular-nums text-subtle">
              {item.posts.length}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <WidgetLayout name={t("series.title")}>
      {list(visible)}
      {overflow.length > 0 ? (
        <details className="mt-1">
          <summary className="cursor-pointer rounded px-1 py-0.5 text-xs text-subtle hover:bg-base-200">
            +{overflow.length}
          </summary>
          <div className="mt-1">{list(overflow)}</div>
        </details>
      ) : null}
    </WidgetLayout>
  );
}
