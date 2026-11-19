import Image from "next/image";

import { siteConfig } from "@/src/config/site";

import { BannerWaves } from "@/src/components/molecules/BannerWaves";

import { GradientFade } from "./GradientFade";

/**
 * Shared wallpaper used by every page.
 *
 * `home` fills the viewport and carries the site title; `page` is shorter and
 * shows the current page's heading. Both animate the waves along the bottom
 * edge, matching the upstream Shirone banner. The waves are pure CSS, so they
 * are server-rendered and already moving on first paint.
 */
export function Banner({
  variant = "home",
  title,
  description,
}: {
  variant?: "home" | "page";
  title?: string;
  description?: string;
}) {
  const home = variant === "home";

  return (
    <div
      className={`relative w-full overflow-hidden ${
        home ? "h-[100svh]" : "h-[45vh] min-h-[380px]"
      }`}
    >
      {/* `isolate` keeps this stacking context local, so the wallpaper is
          painted above the body background rather than behind it. */}
      <div className="absolute inset-0 isolate">
        <Image
          src={siteConfig.banner.src}
          alt=""
          fill
          priority={home}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: siteConfig.banner.position }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black"
          style={{ opacity: siteConfig.banner.dim }}
        />
        <GradientFade className="absolute inset-x-0 bottom-0 h-40" />
        <BannerWaves />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
        {home ? (
          <>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              {siteConfig.title}
            </h1>
            <p className="mt-4 text-base opacity-90 sm:text-lg">
              {siteConfig.subtitle}
            </p>
          </>
        ) : (
          <>
            {/* The banner sits at the top of every non-home page, so its title
                is the page's `h1` — the content below must not repeat it. */}
            <h1 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-sm opacity-85 sm:text-base">
                {description}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
