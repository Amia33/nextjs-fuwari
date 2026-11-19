import type { ReactNode } from "react";

import { Footer } from "@/src/components/organisms/Footer";
import { PrimarySidebar } from "@/src/components/organisms/PrimarySidebar";
import { SecondarySidebar } from "@/src/components/organisms/SecondarySidebar";
import { sidebarConfig } from "@/src/config/sidebar";

/**
 * Three-column reading shell: primary sidebar, content column, secondary
 * sidebar. Both sidebars persist across every page because each page renders
 * this shell rather than opting in individually.
 *
 * Breakpoints mirror the upstream behaviour: the primary column appears at
 * `lg`, the secondary only at `xl`; below those the layout degrades to a single
 * column instead of squeezing the prose.
 *
 * The footer lives *inside* the content column so it aligns to the reading
 * measure rather than spanning the full page width.
 */
export function PageShell({
  children,
  page,
  toc,
  wide = false,
}: {
  children: ReactNode;
  /** Current page identifier, used for per-page widget visibility. */
  page?: string;
  /** Extra widget for the secondary column (the post table of contents). */
  toc?: ReactNode;
  /** Widen the content column (lists) instead of the reading measure (posts). */
  wide?: boolean;
}) {
  const dual = sidebarConfig.arrangement === "dual";

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div
        className={`grid gap-8 py-8 lg:grid-cols-[17.5rem_minmax(0,1fr)] ${
          dual ? "xl:grid-cols-[17.5rem_minmax(0,1fr)_17.5rem]" : ""
        }`}
      >
        <PrimarySidebar page={page} />

        <div className="min-w-0">
          <main id="content" className={wide ? "" : "mx-auto w-full max-w-3xl"}>
            {children}
          </main>
          <Footer />
        </div>

        {dual ? <SecondarySidebar toc={toc} /> : null}
      </div>
    </div>
  );
}
