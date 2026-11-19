"use client";

import { useEffect, useState } from "react";

import type { Heading } from "@/src/content/headings";
import { t } from "@/src/i18n";

/**
 * Sidebar table of contents with a reading-position highlight.
 *
 * The active heading is whichever one has most recently crossed 35% of the
 * viewport height — the rule the upstream Shirone TOC uses. Scroll events are
 * coalesced through `requestAnimationFrame`; the handler only reads layout
 * (no interleaved writes), so it does not force repeated reflow.
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

      const threshold = window.innerHeight * 0.35;
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

  if (headings.length < 2) return null;

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wider opacity-50">
        {t("post.toc")}
      </h2>
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
                      : "border-transparent opacity-60 hover:text-primary hover:opacity-100"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
