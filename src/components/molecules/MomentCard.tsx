import Image from "next/image";

import { Mdx } from "@/src/components/molecules/Mdx";
import { PasswordGate } from "@/src/components/organisms/PasswordGate";
import type { PublicMoment } from "@/src/content/moments";
import { formatDate } from "@/src/i18n";

/**
 * A moment card. When the moment is protected and the visitor has not unlocked
 * it, the body is replaced by the gate — the MDX never reaches the client.
 */
export function MomentCard({
  moment,
  unlocked,
}: {
  moment: PublicMoment;
  /** Gate resolution for this moment, read once for the whole page. */
  unlocked?: boolean;
}) {
  const locked = moment.passwordProtected && !unlocked;

  return (
    <article className="rounded-box border border-base-300 bg-base-100 p-5">
      <header className="mb-3 flex items-center justify-between text-xs text-subtle">
        <time dateTime={moment.published.toISOString()}>
          {formatDate(moment.published)}
        </time>
        {moment.location ? <span>{moment.location}</span> : null}
      </header>

      {locked ? (
        <PasswordGate
          kind="moment"
          id={moment._meta.path}
          hint={moment.passwordHint}
        />
      ) : (
        <>
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
              {moment.images.map((image) => (
                <li
                  key={image.src}
                  className="relative aspect-[4/3] overflow-hidden rounded-box bg-base-200"
                >
                  <a
                    href={image.src}
                    className="block h-full w-full"
                    data-pswp-src={image.src}
                    data-pswp-width="1600"
                    data-pswp-height="1200"
                  >
                    <Image
                      src={image.src}
                      // A moment photo is a standalone link to the full-size
                      // image with no adjacent text, so the frontmatter alt is
                      // its only accessible name.
                      alt={image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 24rem"
                      unoptimized={image.src.startsWith("/vault/")}
                      className="object-cover"
                    />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          {moment.mood ? (
            <p className="mt-3 text-xs text-subtle">{moment.mood}</p>
          ) : null}
        </>
      )}
    </article>
  );
}
