"use client";

import { VideoPlayer, VideoSkin, Video } from "@videojs/react/video";
import "@videojs/react/video/skin.css";

export function VideoPlayerBlock({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title?: string;
}) {
  return (
    <figure className="not-prose my-6">
      <VideoPlayer title={title}>
        <VideoSkin className="overflow-hidden rounded-box">
          <Video src={src} poster={poster} playsInline />
        </VideoSkin>
      </VideoPlayer>
      {title ? (
        <figcaption className="mt-2 text-center text-sm text-subtle">
          {title}
        </figcaption>
      ) : null}
    </figure>
  );
}
