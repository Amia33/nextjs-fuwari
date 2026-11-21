import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostIndex } from "@/src/components/organisms/PostIndex";
import { getPaginatedPosts } from "@/src/content/posts";
import { postListConfig } from "@/src/config/post-list";
import { t } from "@/src/i18n";
import { pageMetadata } from "@/src/lib/metadata";

type Props = PageProps<"/page/[page]">;

/**
 * Every page of the index is prerendered in full, exactly like the home index:
 * the posts come from build-time content and the only URL data is `params`,
 * which `generateStaticParams()` enumerates. Requiring static output keeps it
 * that way, and stops any future invalidation from turning the route into a
 * 500 — awaiting `params` outside `<Suspense>` bails on regeneration.
 */
export const ensureStatic = "navigation";

/**
 * Page 1 is included so `/page/1` resolves to the same content as `/` instead
 * of 404ing. Its canonical points at `/`.
 *
 * Cache Components requires a non-empty result, so a single-page blog still
 * yields `[{ page: "1" }]`.
 */
export function generateStaticParams() {
  const { totalPages } = getPaginatedPosts(1, postListConfig.pageSize);
  return Array.from({ length: totalPages }, (_, index) => ({
    page: String(index + 1),
  }));
}

/**
 * Accepts only the canonical spelling of a page number: no leading zeros, no
 * decimal or exponent notation, and nothing past the last page. Without the
 * upper bound every `/page/N` renders the final page with a 200, because
 * `getPaginatedPosts` clamps instead of failing.
 */
function isPageSegment(raw: string, page: number, totalPages: number): boolean {
  return (
    /^[1-9]\d*$/.test(raw) &&
    Number.isSafeInteger(page) &&
    String(page) === raw &&
    page <= totalPages
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: rawPage } = await params;
  const pageNumber = Number(rawPage);
  const { totalPages } = getPaginatedPosts(1, postListConfig.pageSize);

  // Page 1 is the index by another name, so it defers to `/` rather than
  // competing with it; an invalid page is left for the 404 to handle.
  if (pageNumber === 1 || !isPageSegment(rawPage, pageNumber, totalPages)) {
    return pageMetadata({ path: "/" });
  }

  return pageMetadata({
    path: `/page/${pageNumber}`,
    title: t("list.pageTitle", { page: pageNumber }),
    description: t("list.pageDescription", { page: pageNumber }),
  });
}

export default async function PageNumber({ params }: Props) {
  const { page: rawPage } = await params;
  const pageNumber = Number(rawPage);
  const { totalPages } = getPaginatedPosts(1, postListConfig.pageSize);

  if (!isPageSegment(rawPage, pageNumber, totalPages)) notFound();

  return <PostIndex page={pageNumber} />;
}
