import type { ReactNode } from "react";

import { Alert } from "./Alert";
import { AudioPlayerBlock } from "./AudioPlayerBlock";
import { Collapse } from "./Collapse";
import { ProseImage } from "./ProseImage";
import { SmartLink } from "./SmartLink";
import { Tab, Tabs } from "./Tabs";
import { VideoPlayerBlock } from "./VideoPlayerBlock";

export function Video({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title?: string;
}) {
  return <VideoPlayerBlock src={src} poster={poster} title={title} />;
}

export function Audio({ src, title }: { src: string; title?: string }) {
  return <AudioPlayerBlock src={src} title={title} />;
}

function Table({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-6 overflow-x-auto">
      <table className="table table-sm">{children}</table>
    </div>
  );
}

export const mdxComponents = {
  Alert,
  Collapse,
  Tabs,
  Tab,
  Video,
  Audio,
  img: ProseImage,
  a: SmartLink,
  table: Table,
};
