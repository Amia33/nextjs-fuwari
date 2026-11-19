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

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          transitionTypes={["nav-back"]}
          className="btn btn-ghost btn-sm"
        >
          ← {t("list.prevPage")}
        </Link>
      ) : (
        <span className="btn btn-ghost btn-sm btn-disabled">
          ← {t("list.prevPage")}
        </span>
      )}

      <span className="px-2 text-sm opacity-60">
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          transitionTypes={["nav-forward"]}
          className="btn btn-ghost btn-sm"
        >
          {t("list.nextPage")} →
        </Link>
      ) : (
        <span className="btn btn-ghost btn-sm btn-disabled">
          {t("list.nextPage")} →
        </span>
      )}
    </nav>
  );
}
