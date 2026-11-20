import Image from "next/image";
import Link from "next/link";

import { LockedCover } from "@/src/components/atoms/LockedCover";
import type { PublicPost } from "@/src/content/posts";
import { formatDate, t } from "@/src/i18n";

export function PostCard({ post, index }: { post: PublicPost; index: number }) {
  return (
    <li>
      <article className="group">
        <Link
          href={`/posts/${post._meta.path}`}
          transitionTypes={["nav-forward"]}
          className="flex flex-col overflow-hidden rounded-box no-underline sm:flex-row-reverse sm:items-stretch sm:gap-6 sm:p-3 sm:transition-colors sm:hover:bg-base-200"
        >
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-box bg-base-200 sm:aspect-[4/3] sm:w-44">
            {post.passwordProtected ? (
              <LockedCover />
            ) : post.image ? (
              <Image
                src={post.image}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 176px"
                priority={index < 2}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                style={{ viewTransitionName: `cover-${post._meta.path}` }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs opacity-40">
                {post.category ?? "—"}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col py-3 sm:py-0">
            <h2 className="line-clamp-2 text-sm font-medium leading-snug sm:text-base">
              {post.pinned ? (
                <span className="badge badge-primary badge-xs mr-2 align-middle">
                  {t("post.pinned")}
                </span>
              ) : null}
              {post.title}
            </h2>

            <time
              dateTime={post.published.toISOString()}
              className="mt-1.5 text-xs opacity-60 sm:mt-2"
            >
              {formatDate(post.published)}
            </time>

            {post.description ? (
              <p className="mt-2 hidden line-clamp-2 text-sm opacity-70 sm:block">
                {post.description}
              </p>
            ) : null}

            <div className="mt-auto hidden items-center gap-3 pt-3 text-xs opacity-50 sm:flex">
              {post.category ? <span>{post.category}</span> : null}
              <span>{t("post.readingTime", { minutes: post.minutes })}</span>
            </div>
          </div>
        </Link>
      </article>
    </li>
  );
}
