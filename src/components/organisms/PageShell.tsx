import type { ReactNode } from "react";

import { Banner } from "@/src/components/organisms/Banner";
import { Footer } from "@/src/components/organisms/Footer";
import { PrimarySidebar } from "@/src/components/organisms/PrimarySidebar";
import { SecondarySidebar } from "@/src/components/organisms/SecondarySidebar";
import { sidebarConfig } from "@/src/config/sidebar";

/**
 * Three-column reading shell: primary sidebar, content column, secondary
 * sidebar. Both sidebars persist across every page because each page renders
 * this shell rather than opting in individually.
 *
 * Column proportions follow the upstream Shirone grid: two equal 17.5rem
 * sidebars and a flexible centre column, inside a 96rem frame.
 *
 * The primary column appears at `lg`, the secondary only at `xl`; below those
 * the layout degrades to a single column instead of squeezing the prose.
 *
 * The banner is rendered here too, so every page gets the wallpaper and
 * animated waves without each route having to remember. Non-home pages use the
 * shorter banner carrying their own title, matching upstream behaviour.
 * `bannerVariant` decouples that choice from `home` for pages that want the
 * site banner without the home layout's stats widget.
 *
 * The footer lives *inside* the content column so it aligns to the reading
 * measure rather than spanning the full page width.
 */
export function PageShell({
  children,
  page,
  toc,
  wide = false,
  home = false,
  stats,
  bannerVariant,
  bannerTitle,
  bannerDescription,
  bannerSiteTitleAs,
}: {
  children: ReactNode;
  /** Current page identifier, used for per-page widget visibility. */
  page?: string;
  /** Extra widget for the secondary column (the post table of contents). */
  toc?: ReactNode;
  /** Widen the content column (lists) instead of the reading measure (posts). */
  wide?: boolean;
  /** Home uses the full-viewport banner with the site title. */
  home?: boolean;
  /** Site-stats widget; defaults to `home`, since it is an index fixture. */
  stats?: boolean;
  /** Banner shape, when it should differ from the `home` default. */
  bannerVariant?: "home" | "page";
  bannerTitle?: string;
  bannerDescription?: string;
  /** Heading element for the banner's site title; `p` when the page has its own `h1`. */
  bannerSiteTitleAs?: "h1" | "p";
}) {
  const dual = sidebarConfig.arrangement === "dual";

  return (
    <>
      <Banner
        variant={bannerVariant ?? (home ? "home" : "page")}
        title={bannerTitle}
        description={bannerDescription}
        siteTitleAs={bannerSiteTitleAs}
      />

      <div className="mx-auto w-full max-w-[96rem] px-4">
        <div
          className={`grid gap-8 py-8 lg:grid-cols-[17.5rem_minmax(0,1fr)] ${
            dual ? "xl:grid-cols-[17.5rem_minmax(0,1fr)_17.5rem]" : ""
          }`}
        >
          <PrimarySidebar page={page} />

          <div className="min-w-0">
            <main
              id="content"
              className={wide ? "" : "mx-auto w-full max-w-4xl"}
            >
              {children}
            </main>
            <Footer />
          </div>

          {dual ? (
            <SecondarySidebar toc={toc} showStats={stats ?? home} />
          ) : null}
        </div>
      </div>
    </>
  );
}
