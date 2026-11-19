import Link from "next/link";

import { getTagList } from "@/src/content/posts";
import { t } from "@/src/i18n";

import { WidgetLayout } from "./WidgetLayout";

export function TagsWidget({ collapseAfter = 12 }: { collapseAfter?: number }) {
  const tags = getTagList();
  if (tags.length === 0) return null;

  const visible = tags.slice(0, collapseAfter);
  const overflow = tags.slice(collapseAfter);

  const list = (items: typeof tags) => (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item.name}>
          <Link
            href={`/archive?tag=${encodeURIComponent(item.name)}`}
            transitionTypes={["nav-forward"]}
            className="badge badge-ghost badge-sm"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <WidgetLayout name={t("tags.title")}>
      {list(visible)}
      {overflow.length > 0 ? (
        <details className="mt-1">
          <summary className="cursor-pointer rounded px-1 py-0.5 text-xs opacity-60 hover:bg-base-200">
            +{overflow.length}
          </summary>
          <div className="mt-1.5">{list(overflow)}</div>
        </details>
      ) : null}
    </WidgetLayout>
  );
}
