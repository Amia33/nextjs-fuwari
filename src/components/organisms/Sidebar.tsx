import Image from "next/image";
import Link from "next/link";

import {
  getCategoryList,
  getSeriesList,
  getTagList,
} from "@/src/content/posts";
import { postListConfig } from "@/src/config/post-list";
import { profileConfig } from "@/src/config/profile";
import { t } from "@/src/i18n";

export function Sidebar() {
  const categories = getCategoryList().filter((item) => item.name);
  const tags = getTagList().slice(0, postListConfig.tagCount);
  const series = getSeriesList();

  return (
    <aside className="hidden w-[17.5rem] shrink-0 lg:block">
      <div className="sticky top-20 space-y-4">
        <section className="rounded-box border border-base-300 bg-base-100 p-4">
          <div className="flex items-center gap-3">
            <Image
              src={profileConfig.avatar}
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-full bg-base-200 object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{profileConfig.name}</p>
              <p className="truncate text-xs opacity-60">{profileConfig.bio}</p>
            </div>
          </div>
        </section>

        {categories.length > 0 ? (
          <section className="rounded-box border border-base-300 bg-base-100 p-4">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider opacity-50">
              {t("categories.title")}
            </h2>
            <ul className="space-y-1 text-sm">
              {categories.map((item) => (
                <li key={item.name}>
                  <Link
                    href={`/archive?category=${encodeURIComponent(item.name)}`}
                    transitionTypes={["nav-forward"]}
                    className="flex justify-between rounded px-1 py-0.5 hover:bg-base-200"
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="opacity-40">{item.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tags.length > 0 ? (
          <section className="rounded-box border border-base-300 bg-base-100 p-4">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider opacity-50">
              {t("tags.title")}
            </h2>
            <ul className="flex flex-wrap gap-1.5">
              {tags.map((item) => (
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
          </section>
        ) : null}

        {series.length > 0 ? (
          <section className="rounded-box border border-base-300 bg-base-100 p-4">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider opacity-50">
              {t("series.title")}
            </h2>
            <ul className="space-y-1 text-sm">
              {series.map((item) => (
                <li key={item.name}>
                  <Link
                    href={`/series/${encodeURIComponent(item.name)}`}
                    transitionTypes={["nav-forward"]}
                    className="flex justify-between rounded px-1 py-0.5 hover:bg-base-200"
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="opacity-40">{item.posts.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
