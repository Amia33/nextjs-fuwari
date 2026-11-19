import Link from "next/link";
import { notFound } from "next/navigation";

import { Mdx } from "@/src/components/molecules/Mdx";
import { PageShell } from "@/src/components/organisms/PageShell";
import { getPostsBySeries } from "@/src/content/posts";
import { getSeries, getSeriesBySlug } from "@/src/content/series";
import { t } from "@/src/i18n";

type Props = PageProps<"/series/[slug]">;

/**
 * Every series page is prerendered in full: the document and its posts all come
 * from build-time content, and the only URL data is `params`, which
 * `generateStaticParams()` enumerates up front.
 *
 * Declaring `'navigation'` requires the complete route to be static output, so
 * this page renders without a runtime pass like its siblings do. That matters
 * because awaiting `params` outside `<Suspense>` is what makes a route bail on
 * regeneration — previously any invalidation of this route turned it into a 500.
 * The build now fails loudly if request-time data is ever introduced here,
 * rather than degrading to an error page at request time.
 */
export const ensureStatic = "navigation";

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
    <PageShell
      page="series"
      bannerTitle={doc?.title ?? slug}
      bannerDescription={t("series.posts", { count: posts.length })}
    >
      <article>
        {doc ? (
          <Mdx code={doc.mdx} className="prose mb-10 text-spacing-trim" />
        ) : null}

        {/* Numbering is positional: the list is already ordered by each
            post's `seriesOrder`, so the index is the reading order. */}
        <ol className="divide-y divide-base-300 border-t border-base-300">
          {posts.map((post, index) => (
            <li key={post._meta.path}>
              <Link
                href={`/posts/${post._meta.path}`}
                transitionTypes={["nav-forward"]}
                className="flex items-baseline gap-3 py-3 hover:text-primary"
              >
                <span
                  aria-hidden="true"
                  className="text-sm font-medium tabular-nums opacity-40"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm">{post.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </article>
    </PageShell>
  );
}
