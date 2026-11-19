import Image from "next/image";

import { Mdx } from "@/src/components/molecules/Mdx";
import type { PublicMoment } from "@/src/content/moments";
import { formatDate } from "@/src/i18n";

export function MomentCard({ moment }: { moment: PublicMoment }) {
  return (
    <article className="rounded-box border border-base-300 bg-base-100 p-5">
      <header className="mb-3 flex items-center justify-between text-xs opacity-60">
        <time dateTime={moment.published.toISOString()}>
          {formatDate(moment.published)}
        </time>
        {moment.location ? <span>{moment.location}</span> : null}
      </header>

      <Mdx
        code={moment.mdx}
        className="prose max-w-none text-sm text-spacing-trim"
      />

      {moment.images.length > 0 ? (
        <ul
          className={`mt-4 grid gap-2 ${
            moment.images.length === 1
              ? "grid-cols-1"
              : moment.images.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {moment.images.map((src) => (
            <li
              key={src}
              className="relative aspect-[4/3] overflow-hidden rounded-box bg-base-200"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 24rem"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      ) : null}

      {moment.mood ? (
        <p className="mt-3 text-xs opacity-50">{moment.mood}</p>
      ) : null}
    </article>
  );
}
