import { notFound } from "next/navigation";

import { Mdx } from "@/src/components/molecules/Mdx";
import { PageShell } from "@/src/components/organisms/PageShell";
import { getSpec } from "@/src/content/spec";
import { t } from "@/src/i18n";

export const metadata = { title: t("about.title") };

export default function AboutPage() {
  const doc = getSpec("about");
  if (!doc) notFound();

  return (
    <PageShell page="about">
      <article>
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">{doc.title}</h1>
        </header>
        <Mdx code={doc.mdx} />
      </article>
    </PageShell>
  );
}
