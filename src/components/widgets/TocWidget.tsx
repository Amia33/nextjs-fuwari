import type { Heading } from "@/src/content/headings";
import { t } from "@/src/i18n";

export function TocWidget({ headings }: { headings: Heading[] }) {
  if (headings.length < 2) return null;

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wider opacity-50">
        {t("post.toc")}
      </h2>
      <nav aria-label={t("post.toc")}>
        <ul className="max-h-[calc(100dvh-16rem)] space-y-1 overflow-y-auto text-sm">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{ paddingInlineStart: `${(heading.depth - 2) * 0.75}rem` }}
            >
              <a
                href={`#${heading.id}`}
                className="block truncate py-0.5 opacity-70 hover:text-primary hover:opacity-100"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
