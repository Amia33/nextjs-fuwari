import { notFound } from "next/navigation";

import { Mdx } from "@/src/components/molecules/Mdx";
import { getSpec } from "@/src/content/spec";
import { t } from "@/src/i18n";

export const metadata = { title: t("about.title") };

export default function AboutPage() {
  const doc = getSpec("about");
  if (!doc) notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{doc.title}</h1>
      </header>
      <Mdx code={doc.mdx} />
    </article>
  );
}
