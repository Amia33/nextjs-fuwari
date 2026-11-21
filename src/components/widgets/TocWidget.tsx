"use client";

import { useEffect, useState } from "react";

import type { Heading } from "@/src/content/headings";
import { t } from "@/src/i18n";

import { WidgetLayout } from "./WidgetLayout";

/**
 * Where a heading becomes the active one, as a fraction of the viewport height.
 *
 * A heading switches on once its top crosses this line. 0.25 keeps the highlight
 * in the top quarter of the screen, just below the 4rem sticky header, rather
 * than switching while the heading is still a third of the way down.
 */
const ACTIVE_LINE_RATIO = 0.25;

/**
 * Sidebar table of contents with a reading-position highlight.
 *
 * The active heading is whichever one has most recently crossed
 * `ACTIVE_LINE_RATIO` of the viewport height. Scroll events are coalesced
 * through `requestAnimationFrame`; the handler only reads layout (no
 * interleaved writes), so it does not force repeated reflow.
 *
 * Heading elements are resolved lazily on every measurement rather than once in
 * the effect: the article body sits behind a `<Suspense>` boundary (the gate
 * reads cookies), so on first paint the headings have not streamed in yet. A
 * one-shot lookup would bind to an empty list and never recover.
 */
export function TocWidget({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    let frame = 0;

    const measure = () => {
      frame = 0;

      const elements = headings
        .map((heading) => document.getElementById(heading.id))
        .filter((element): element is HTMLElement => element !== null);

      if (elements.length === 0) return;

      const threshold = window.innerHeight * ACTIVE_LINE_RATIO;
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;

      let current = elements[0].id;

      if (atBottom) {
        current = elements[elements.length - 1].id;
      } else {
        for (const element of elements) {
          if (element.getBoundingClientRect().top > threshold) break;
          current = element.id;
        }
      }

      setActiveId((previous) => (previous === current ? previous : current));
    };

    const schedule = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(measure);
    };

    schedule();

    // The article can arrive after this effect (Suspense streaming), and it can
    // grow again if a gate is unlocked. Re-measure whenever the DOM changes.
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headings]);

  return (
    <WidgetLayout name={t("post.toc")}>
      <nav aria-label={t("post.toc")}>
        <ul className="max-h-[calc(100dvh-16rem)] space-y-0.5 overflow-y-auto text-sm">
          {headings.map((heading) => {
            const active = heading.id === activeId;

            return (
              <li
                key={heading.id}
                style={{
                  paddingInlineStart: `${(heading.depth - 2) * 0.75}rem`,
                }}
              >
                <a
                  href={`#${heading.id}`}
                  aria-current={active ? "location" : undefined}
                  className={`block truncate rounded-s border-s-2 py-0.5 ps-2 transition-colors ${
                    active
                      ? "border-primary font-medium text-primary"
                      : "border-transparent text-subtle hover:text-primary"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </WidgetLayout>
  );
}
