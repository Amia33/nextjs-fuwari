import Link from "next/link";

import { t } from "@/src/i18n";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-semibold tabular-nums opacity-15">404</p>
      <h1 className="mt-4 text-xl font-medium">{t("notFound.title")}</h1>
      <p className="mt-2 text-sm opacity-60">{t("notFound.description")}</p>
      <Link href="/" className="btn btn-sm mt-6" transitionTypes={["nav-back"]}>
        {t("notFound.back")}
      </Link>
    </div>
  );
}
