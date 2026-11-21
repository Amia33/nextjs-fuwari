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
        home ? "h-[92svh] min-h-[34rem]" : "h-[45vh] min-h-[380px]"
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

      {/* The home masthead is an editorial front page, not a centered
          template hero. On wide screens the title block anchors to the
          bottom-left, sitting above the waves like a title page; on phones it
          stays vertically centered so the block does not float in a short
          field. The title and subtitle both use WenKai so the front door
          speaks in the same face as the prose. Inner pages keep a centered
          header because there the banner is a page label, not the front
          door. */}
      {home ? (
        <div className="relative flex h-full items-center px-4 text-white sm:items-end sm:pb-44">
          <div className="mx-auto w-full max-w-[96rem]">
            <div className="max-w-3xl">
              <h1 className="text-balance font-serif text-5xl font-semibold leading-[1.06] tracking-tight sm:text-7xl">
                {siteConfig.title}
              </h1>
              <p className="mt-4 max-w-xl font-serif text-lg leading-relaxed text-white/80 sm:mt-5 sm:text-xl">
                {siteConfig.subtitle}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
