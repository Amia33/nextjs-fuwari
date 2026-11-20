import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Mdx } from "@/src/components/molecules/Mdx";
import { PageShell } from "@/src/components/organisms/PageShell";
import { ProtectedBody } from "@/src/components/organisms/ProtectedBody";
import { PhotoSwipeProvider } from "@/src/components/organisms/PhotoSwipeProvider";
import { getAlbumById, getAlbums } from "@/src/content/albums";
import { formatDate, t } from "@/src/i18n";

type Props = PageProps<"/albums/[id]">;

// The gate reads cookies, which is request data.
export const instant = false;

export async function generateStaticParams() {
  return getAlbums().map((album) => ({ id: album._meta.path }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const album = getAlbumById(id);
  return {
    title: album?.title ?? id,
    description: album?.description,
    robots: album?.passwordProtected ? { index: false } : undefined,
  };
}

export default async function AlbumDetail({ params }: Props) {
  const { id } = await params;
  const album = getAlbumById(id);
  if (!album) notFound();

  return (
    <PageShell
      page="albums"
      bannerTitle={album.title}
      bannerDescription={`${formatDate(album.published)} · ${t("albums.photos", { count: album.photos.length })}`}
    >
      <article>
        <div className="mb-6">
          <Link
            href="/albums"
            transitionTypes={["nav-back"]}
            className="text-sm opacity-60 hover:opacity-100"
          >
            ← {t("albums.title")}
          </Link>
        </div>

        {album.description ? (
          <p className="mb-6 text-sm opacity-70">{album.description}</p>
        ) : null}

        <Suspense
          fallback={
            <p className="py-8 text-sm opacity-60">{t("common.loading")}</p>
          }
        >
          <ProtectedBody
            kind="album"
            id={album._meta.path}
            code={album.mdx}
            html={
              <>
                <ul className="columns-1 gap-3 sm:columns-2 [&>li]:mb-3">
                  {album.photos.map((photo) => (
                    <li key={photo.src} className="break-inside-avoid">
                      <a
                        href={photo.src}
                        className="block overflow-hidden rounded-box"
                        data-pswp-src={photo.src}
                        data-pswp-width="1600"
                        data-pswp-height="1067"
                      >
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          width={800}
                          height={533}
                          sizes="(max-width: 640px) 100vw, 24rem"
                          unoptimized={photo.src.startsWith("/vault/")}
                          className="h-auto w-full"
                        />
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Mdx code={album.mdx} />
                </div>
              </>
            }
          />
        </Suspense>

        <PhotoSwipeProvider />
      </article>
    </PageShell>
  );
}
