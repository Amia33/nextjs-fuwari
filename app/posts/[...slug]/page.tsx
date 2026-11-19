import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";

import { DateAgo, DateSpan } from "@/src/components/molecules/RelativeTime";
import { PageShell } from "@/src/components/organisms/PageShell";
import { ProtectedBody } from "@/src/components/organisms/ProtectedBody";
import { PhotoSwipeProvider } from "@/src/components/organisms/PhotoSwipeProvider";
import { PostToc } from "@/src/components/organisms/PostToc";
import { getPostBySlug, getSortedPosts } from "@/src/content/posts";
import { articleConfig } from "@/src/config/article";
import { siteConfig } from "@/src/config/site";
import { formatDate, formatDateIso, t } from "@/src/i18n";
import { extractHeadings } from "@/src/content/headings";

type Props = PageProps<"/posts/[...slug]">;

export const instant = false;

export async function generateStaticParams() {
  return getSortedPosts().map((post) => ({ slug: [post._meta.path] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug.join("/"));
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    robots: post.passwordProtected ? { index: false } : undefined,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.published.toISOString(),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug.join("/"));
  if (!post) notFound();

  const headings = extractHeadings(post.content, siteConfig.toc.maxDepth);
  const updatedAgeDays = post.updated
    ? Math.round(
        (post.updated.getTime() - post.published.getTime()) / 86_400_000,
      )
    : 0;
  const showUpdated =
    articleConfig.lastUpdated.enable &&
    post.updated !== undefined &&
    updatedAgeDays >= articleConfig.lastUpdated.minimumAgeDays;

  return (
    <PageShell
      page="post"
      toc={
        headings.length >= siteConfig.toc.minHeadings ? (
          <Suspense fallback={null}>
            <PostToc id={post._meta.path} headings={headings} />
          </Suspense>
        ) : null
      }
      bannerTitle={post.title}
      bannerDescription={post.description || undefined}
      bannerImage={post.image}
      bannerImageTransitionName={`cover-${post._meta.path}`}
    >
      <article className="pb-4">
        <header className="mb-8">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm opacity-70">
            <span>{t("post.published")}</span>
            <time dateTime={formatDateIso(post.published)}>
              {formatDate(post.published)}
            </time>
            {showUpdated && post.updated ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{t("post.updated")}</span>
                <time dateTime={formatDateIso(post.updated)}>
                  <Suspense fallback={formatDate(post.updated)}>
                    <DateAgo iso={post.updated.toISOString()} />
                  </Suspense>
                </time>
                <span aria-hidden="true">·</span>
                <Suspense fallback={null}>
                  <DateSpan
                    from={post.published.toISOString()}
                    to={post.updated.toISOString()}
                  />
                </Suspense>
              </>
            ) : null}
            <span aria-hidden="true">·</span>
            <span>{t("post.readingTime", { minutes: post.minutes })}</span>
          </p>

          {post.tags.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/archive?tag=${encodeURIComponent(tag)}`}
                    transitionTypes={["nav-forward"]}
                    className="badge badge-ghost badge-sm"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <Suspense
          fallback={
            <p className="py-8 text-sm opacity-60">{t("common.loading")}</p>
          }
        >
          <ProtectedBody kind="post" id={post._meta.path} code={post.mdx} />
        </Suspense>

        <PhotoSwipeProvider />
      </article>
    </PageShell>
  );
}
