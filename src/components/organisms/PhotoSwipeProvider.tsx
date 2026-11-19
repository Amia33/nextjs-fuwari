"use client";

import { useEffect } from "react";

const CSS_ID = "photoswipe-css";

/**
 * Mounts PhotoSwipe over every `a[data-pswp-src]` on the page.
 *
 * Links are discovered with a `MutationObserver` rather than a one-shot query:
 * gated content streams in through a `<Suspense>` boundary *after* mount, so on
 * a first visit the album grid does not exist yet when this effect runs and a
 * single sweep would leave the gallery unbound. Observing lets the lightbox
 * pick the unlocked images up the moment they arrive, and it covers any image
 * added later by client-side navigation.
 */
export function PhotoSwipeProvider() {
  useEffect(() => {
    let lightbox: { destroy: () => void } | undefined;
    let cancelled = false;
    let boundCount = 0;

    async function init() {
      if (!document.getElementById(CSS_ID)) {
        const link = document.createElement("link");
        link.id = CSS_ID;
        link.rel = "stylesheet";
        link.href = "/photoswipe.css";
        document.head.append(link);
      }

      const [{ default: PhotoSwipe }, { default: PhotoSwipeLightbox }] =
        await Promise.all([
          import("photoswipe"),
          import("photoswipe/lightbox"),
        ]);

      if (cancelled) return;

      // `article` scopes each gallery, so paging through one moment's images
      // never spills into another moment's set.
      const lb = new PhotoSwipeLightbox({
        gallery: "article",
        children: "a[data-pswp-src]",
        pswpModule: PhotoSwipe,
        bgOpacity: 0.92,
        showHideAnimationType: "fade",
      });
      lb.init();
      lightbox = lb;
    }

    function sync() {
      const count = document.querySelectorAll("a[data-pswp-src]").length;
      if (count === boundCount) return;

      // The set changed (streamed in, unlocked, or navigated away). Rebuild so
      // the lightbox indexes the current DOM rather than a stale one.
      lightbox?.destroy();
      lightbox = undefined;
      boundCount = count;
      if (count > 0) void init();
    }

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      observer.disconnect();
      lightbox?.destroy();
    };
  }, []);

  return null;
}
