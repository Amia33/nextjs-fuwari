import Link from "next/link";

import { getCategoryList } from "@/src/content/posts";
import { PageShell } from "@/src/components/organisms/PageShell";
import { t } from "@/src/i18n";

export const metadata = { title: t("categories.title") };

export default function CategoriesPage() {
  const categories = getCategoryList().filter((item) => item.name);

  return (
    <PageShell
      page="categories"
      bannerTitle={t("categories.title")}
      bannerDescription={t("categories.description")}
    >
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
    </PageShell>
  );
}
