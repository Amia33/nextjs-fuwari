import Link from "next/link";

import { getCategoryList } from "@/src/content/posts";
import { t } from "@/src/i18n";

export const metadata = { title: t("categories.title") };

export default function CategoriesPage() {
  const categories = getCategoryList().filter((item) => item.name);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("categories.title")}
        </h1>
        <p className="mt-1 text-sm opacity-60">{t("categories.description")}</p>
      </header>

      <ul className="divide-y divide-base-300">
        {categories.map((item) => (
          <li key={item.name}>
            <Link
              href={`/archive?category=${encodeURIComponent(item.name)}`}
              transitionTypes={["nav-forward"]}
              className="flex items-center justify-between py-3 hover:text-primary"
            >
              <span>{item.name}</span>
              <span className="text-sm opacity-50">
                {t("categories.count", { count: item.count })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
