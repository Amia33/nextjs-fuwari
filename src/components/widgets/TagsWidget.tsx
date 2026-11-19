import Link from "next/link";

import { getTagList } from "@/src/content/posts";
import { t } from "@/src/i18n";

import { WidgetLayout } from "./WidgetLayout";

/**
 * Tag cloud. The overflow affordance is a plain link to `/tags` rather than a
 * collapsible list: the full tag set already has a dedicated page, so hiding
 * the remainder behind a disclosure duplicates that page inside the sidebar.
 */
export function TagsWidget({ limit = 12 }: { limit?: number }) {
  const tags = getTagList();
  if (tags.length === 0) return null;

  const visible = tags.slice(0, limit);
  const hasMore = tags.length > visible.length;

  return (
    <WidgetLayout name={t("tags.title")}>
      <ul className="flex flex-wrap gap-1.5">
        {visible.map((item) => (
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

      {hasMore ? (
        <Link
          href="/tags"
          transitionTypes={["nav-forward"]}
          className="mt-2 inline-block text-xs opacity-60 hover:text-primary hover:opacity-100"
        >
          {t("tags.viewAll", { count: tags.length })}
        </Link>
      ) : null}
    </WidgetLayout>
  );
}
