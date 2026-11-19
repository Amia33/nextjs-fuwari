import Link from "next/link";

import { getCategoryList } from "@/src/content/posts";
import { t } from "@/src/i18n";

import { WidgetLayout } from "./WidgetLayout";

export function CategoriesWidget({
  collapseAfter = 5,
}: {
  collapseAfter?: number;
}) {
  const categories = getCategoryList().filter((item) => item.name);
  if (categories.length === 0) return null;

  const visible = categories.slice(0, collapseAfter);
  const overflow = categories.slice(collapseAfter);

  const list = (items: typeof categories) => (
    <ul className="space-y-1 text-sm">
      {items.map((item) => (
        <li key={item.name}>
          <Link
            href={`/archive?category=${encodeURIComponent(item.name)}`}
            transitionTypes={["nav-forward"]}
            className="flex justify-between rounded px-1 py-0.5 hover:bg-base-200"
          >
            <span className="truncate">{item.name}</span>
            <span className="tabular-nums opacity-40">{item.count}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <WidgetLayout name={t("categories.title")}>
      {list(visible)}
      {overflow.length > 0 ? (
        <details className="mt-1">
          <summary className="cursor-pointer rounded px-1 py-0.5 text-xs opacity-60 hover:bg-base-200">
            +{overflow.length}
          </summary>
          <div className="mt-1">{list(overflow)}</div>
        </details>
      ) : null}
    </WidgetLayout>
  );
}
