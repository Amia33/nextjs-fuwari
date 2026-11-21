import { notFound } from "next/navigation";

import { Mdx } from "@/src/components/molecules/Mdx";
import { PageShell } from "@/src/components/organisms/PageShell";
import { getSpec } from "@/src/content/spec";
import { t } from "@/src/i18n";
import { pageMetadata } from "@/src/lib/metadata";

export const metadata = pageMetadata({
  path: "/about",
  title: t("about.title"),
});

export default function AboutPage() {
  const doc = getSpec("about");
  if (!doc) notFound();

  return (
    <PageShell page="about" bannerTitle={doc.title}>
      <article>
        <Mdx code={doc.mdx} />
      </article>
    </PageShell>
  );
}
