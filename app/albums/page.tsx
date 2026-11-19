import Image from "next/image";
import Link from "next/link";

import { getAlbums } from "@/src/content/albums";
import { PageShell } from "@/src/components/organisms/PageShell";
import { formatDate, t } from "@/src/i18n";

export const metadata = { title: t("albums.title") };

export default function AlbumsPage() {
  const albums = getAlbums();

  return (
    <PageShell page="albums">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("albums.title")}
        </h1>
        <p className="mt-1 text-sm opacity-60">{t("albums.description")}</p>
      </header>

      {albums.length === 0 ? (
        <p className="py-12 text-center text-sm opacity-60">
          {t("albums.empty")}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {albums.map((album) => (
            <li key={album._meta.path}>
              <Link
                href={`/albums/${album._meta.path}`}
                transitionTypes={["nav-forward"]}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden rounded-box bg-base-200">
                  {album.cover && !album.passwordProtected ? (
                    <Image
                      src={album.cover}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 16rem"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{
                        viewTransitionName: `cover-${album._meta.path}`,
                      }}
                    />
                  ) : album.passwordProtected ? (
                    <div className="flex h-full items-center justify-center text-xs opacity-40">
                      <span aria-hidden="true">🔒</span>
                    </div>
                  ) : null}
                </div>
                <p className="mt-2 truncate text-sm font-medium">
                  {album.title}
                </p>
                <p className="text-xs opacity-50">
                  {formatDate(album.published)} ·{" "}
                  {t("albums.photos", { count: album.photos.length })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
