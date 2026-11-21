import Link from "next/link";

import { getTagList } from "@/src/content/posts";
import { PageShell } from "@/src/components/organisms/PageShell";
import { t } from "@/src/i18n";
import { pageMetadata } from "@/src/lib/metadata";

export const metadata = pageMetadata({
  path: "/tags",
  title: t("tags.title"),
  description: t("tags.description"),
});

export default function TagsPage() {
  const tags = getTagList();

  return (
    <PageShell
      page="tags"
      bannerTitle={t("tags.title")}
      bannerDescription={t("tags.description")}
    >
      <ul className="flex flex-wrap gap-2">
        {tags.map((item) => (
          <li key={item.name}>
            <Link
              href={`/archive?tag=${encodeURIComponent(item.name)}`}
              transitionTypes={["nav-forward"]}
              className="badge badge-lg badge-ghost gap-2"
            >
              {item.name}
              <span className="text-subtle">{item.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
