import Link from "next/link";
import { notFound } from "next/navigation";

import { Mdx } from "@/src/components/molecules/Mdx";
import { getPostsBySeries } from "@/src/content/posts";
import { getSeries, getSeriesBySlug } from "@/src/content/series";
import { t } from "@/src/i18n";

type Props = PageProps<"/series/[slug]">;

export async function generateStaticParams() {
  return getSeries().map((doc) => ({ slug: doc._meta.path }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const doc = getSeriesBySlug(slug);
  return { title: doc?.title ?? slug };
}

export default async function SeriesDetail({ params }: Props) {
  const { slug } = await params;
  const doc = getSeriesBySlug(slug);
  const posts = getPostsBySeries(slug);

  if (!doc && posts.length === 0) notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {doc?.title ?? slug}
        </h1>
        <p className="mt-1 text-sm opacity-60">
          {t("series.posts", { count: posts.length })}
        </p>
      </header>

      {doc ? (
        <Mdx code={doc.mdx} className="prose mb-10 text-spacing-trim" />
      ) : null}

      <ol className="space-y-3 border-t border-base-300 pt-6">
        {posts.map((post, index) => (
          <li key={post._meta.path} className="flex gap-3">
            <span className="text-sm tabular-nums opacity-40">
              {index + 1}.
            </span>
            <Link
              href={`/posts/${post._meta.path}`}
              transitionTypes={["nav-forward"]}
              className="text-sm hover:text-primary"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
