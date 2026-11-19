import Image from "next/image";

import { siteConfig } from "@/src/config/site";

import { GradientFade } from "./GradientFade";
import { Waves } from "./Waves";

export function Banner() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden">
      {/* `isolate` keeps this stacking context local, so the wallpaper is
          painted above the body background rather than behind it. */}
      <div className="absolute inset-0 isolate">
        <Image
          src={siteConfig.banner.src}
          alt=""
          fill
          priority
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
        <Waves className="absolute inset-x-0 bottom-0 h-24 w-full text-base-100" />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          {siteConfig.title}
        </h1>
        <p className="mt-4 text-base opacity-90 sm:text-lg">
          {siteConfig.subtitle}
        </p>
      </div>
    </div>
  );
}
