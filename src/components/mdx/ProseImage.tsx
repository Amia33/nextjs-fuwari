import Image from "next/image";
import type { ComponentProps } from "react";

type ProseImageProps = ComponentProps<"img"> & {
  width?: number | string;
  height?: number | string;
};

export function ProseImage({ src, alt, width, height }: ProseImageProps) {
  if (typeof src !== "string" || !src) return null;

  const w = Number(width) || 1200;
  const h = Number(height) || 800;

  // Vault media is gated per visitor: the optimizer fetches sources without the
  // visitor's cookies, so those URLs must bypass it and load directly.
  const gated = src.startsWith("/vault/");

  return (
    <a
      href={src}
      className="not-prose my-6 block overflow-hidden rounded-box"
      data-pswp-width={w}
      data-pswp-height={h}
      data-pswp-src={src}
    >
      <Image
        src={src}
        alt={alt ?? ""}
        width={w}
        height={h}
        sizes="(max-width: 768px) 100vw, 42em"
        unoptimized={gated}
        className="h-auto w-full"
      />
    </a>
  );
}
