import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";

import { DateAgo, DateSpan } from "@/src/components/molecules/RelativeTime";
import { ProtectedBody } from "@/src/components/organisms/ProtectedBody";
import { PhotoSwipeProvider } from "@/src/components/organisms/PhotoSwipeProvider";
import { getPostBySlug, getSortedPosts } from "@/src/content/posts";
import { articleConfig } from "@/src/config/article";
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

  const headings = extractHeadings(post.content);
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
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          {post.title}
        </h1>

        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm opacity-70">
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
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-box bg-base-200">
          <Image
            src={post.image}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 48rem"
            className="object-cover"
            style={{ viewTransitionName: `cover-${post._meta.path}` }}
          />
        </div>
      ) : null}

      {headings.length >= 2 ? (
        <nav
          aria-label={t("post.toc")}
          className="mb-8 rounded-box border border-base-300 bg-base-200/50 p-4 text-sm"
        >
          <p className="mb-2 font-medium opacity-70">{t("post.toc")}</p>
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{
                  paddingInlineStart: `${(heading.depth - 2) * 0.75}rem`,
                }}
              >
                <a
                  href={`#${heading.id}`}
                  className="link link-hover opacity-80"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <Suspense
        fallback={
          <p className="py-8 text-sm opacity-60">{t("common.loading")}</p>
        }
      >
        <ProtectedBody kind="post" id={post._meta.path} code={post.mdx} />
      </Suspense>

      <div className="mt-12 border-t border-base-300 pt-6 text-sm opacity-60">
        {t("footer.license", { license: articleConfig.license.name })}
      </div>

      <PhotoSwipeProvider />
    </article>
  );
}
