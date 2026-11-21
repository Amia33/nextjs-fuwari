import Link from "next/link";

import { t } from "@/src/i18n";

export function Pagination({
  page,
  totalPages,
  basePath = "",
}: {
  page: number;
  totalPages: number;
  basePath?: string;
}) {
  if (totalPages <= 1) return null;

  const href = (target: number) =>
    target === 1 ? basePath || "/" : `${basePath}/page/${target}`;

  // Phone-sized tap targets; the compact size returns at `sm`.
  const control = "btn btn-ghost btn-sm h-11 min-h-11 sm:h-8 sm:min-h-8";

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label={t("list.pagination")}
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          transitionTypes={["nav-back"]}
          className={control}
        >
          ← {t("list.prevPage")}
        </Link>
      ) : (
        <span className={`${control} btn-disabled`}>
          ← {t("list.prevPage")}
        </span>
      )}

      <span className="px-2 text-sm tabular-nums text-subtle">
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          transitionTypes={["nav-forward"]}
          className={control}
        >
          {t("list.nextPage")} →
        </Link>
      ) : (
        <span className={`${control} btn-disabled`}>
          {t("list.nextPage")} →
        </span>
      )}
    </nav>
  );
}
