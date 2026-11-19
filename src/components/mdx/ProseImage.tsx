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
        className="h-auto w-full"
      />
    </a>
  );
}
