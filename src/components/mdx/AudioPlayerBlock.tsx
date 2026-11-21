"use client";

import { AudioPlayer, AudioSkin, Audio } from "@videojs/react/audio";
import "@videojs/react/audio/skin.css";

export function AudioPlayerBlock({
  src,
  title,
}: {
  src: string;
  title?: string;
}) {
  return (
    <figure className="not-prose my-6">
      <AudioPlayer title={title}>
        <AudioSkin className="rounded-box bg-base-200 p-2">
          <Audio src={src} />
        </AudioSkin>
      </AudioPlayer>
      {title ? (
        <figcaption className="mt-2 text-center text-sm text-subtle">
          {title}
        </figcaption>
      ) : null}
    </figure>
  );
}
