import Link from "next/link";

import { t } from "@/src/i18n";

export default function NotFound() {
  return (
    <main
      id="content"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center"
    >
      <p className="text-6xl font-semibold tabular-nums text-faint">404</p>
      <h1 className="mt-4 text-xl font-medium">{t("notFound.title")}</h1>
      <p className="mt-2 text-sm text-subtle">{t("notFound.description")}</p>
      <Link
        href="/"
        className="btn btn-primary mt-6 h-11 min-h-11"
        transitionTypes={["nav-back"]}
      >
        {t("notFound.back")}
      </Link>
    </main>
  );
}
