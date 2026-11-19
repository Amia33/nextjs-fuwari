"use client";

import { useEffect } from "react";

const CSS_ID = "photoswipe-css";

export function PhotoSwipeProvider() {
  useEffect(() => {
    let lightbox: { destroy: () => void } | undefined;
    let cancelled = false;

    async function setup() {
      const links = document.querySelectorAll("a[data-pswp-src]");
      if (links.length === 0) return;

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

    void setup();

    return () => {
      cancelled = true;
      lightbox?.destroy();
    };
  }, []);

  return null;
}
