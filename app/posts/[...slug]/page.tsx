import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";

import { LockedCover } from "@/src/components/atoms/LockedCover";
import { DateAgo, DateSpan } from "@/src/components/molecules/RelativeTime";
import { PageShell } from "@/src/components/organisms/PageShell";
import { ProtectedBody } from "@/src/components/organisms/ProtectedBody";
import { PhotoSwipeProvider } from "@/src/components/organisms/PhotoSwipeProvider";
import { PostToc } from "@/src/components/organisms/PostToc";
import { getPostBySlug, getSortedPosts } from "@/src/content/posts";
import { getGate } from "@/src/server/auth/gate";
import { isUnlocked } from "@/src/server/auth/session";
import { articleConfig } from "@/src/config/article";
import { siteConfig } from "@/src/config/site";
import { formatDate, formatDateIso, t } from "@/src/i18n";
import { extractHeadings } from "@/src/content/headings";
import { pageMetadata } from "@/src/lib/metadata";

type Props = PageProps<"/posts/[...slug]">;

export const instant = false;

/**
 * The cover is part of the article, so it stays hidden until the post unlocks.
 * Reading the cookie here keeps that decision inside its own `<Suspense>`
 * instead of making the whole page wait on it.
 */
async function PostCover({ id, image }: { id: string; image: string }) {
  if (getGate("post", id) && !(await isUnlocked("post", id))) {
    return (
      <div className="mb-8 aspect-[16/9] w-full overflow-hidden rounded-box bg-base-200">
        <LockedCover />
      </div>
    );
  }

  return (
    <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-box bg-base-200">
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 56rem"
        unoptimized={image.startsWith("/vault/")}
        className="object-cover"
        style={{ viewTransitionName: `cover-${id}` }}
      />
    </div>
  );
}

export async function generateStaticParams() {
  return getSortedPosts().map((post) => ({ slug: [post._meta.path] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join("/");
  const post = getPostBySlug(path);
  if (!post) return {};

  return pageMetadata({
    path: `/posts/${path}`,
    title: post.title,
    description: post.description,
    // The cover is the article's own image; fall back to the site banner.
    image: post.image,
    imageAlt: post.title,
    // A gated post stays out of the index and carries no canonical.
    noindex: post.passwordProtected,
    type: "article",
    publishedTime: post.published.toISOString(),
    modifiedTime: post.updated?.toISOString(),
  });
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
    >
      <article className="pb-4">
        <header className="mb-8">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
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

        {post.image ? (
          <Suspense
            fallback={
              <div className="mb-8 aspect-[16/9] w-full rounded-box bg-base-200" />
            }
          >
            <PostCover id={post._meta.path} image={post.image} />
          </Suspense>
        ) : null}

        <Suspense
          fallback={
            <p className="py-8 text-sm text-subtle">{t("common.loading")}</p>
          }
        >
          <ProtectedBody kind="post" id={post._meta.path} code={post.mdx} />
        </Suspense>

        <PhotoSwipeProvider />
      </article>
    </PageShell>
  );
}
