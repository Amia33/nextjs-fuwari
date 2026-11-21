import { MDXContent } from "@content-collections/mdx/react";
import { mdxComponents } from "@/src/components/mdx";

/**
 * KaTeX is only needed by documents that contain math — two posts out of the
 * whole site. Importing its stylesheet from `globals.css` put it in the shared
 * CSS bundle for every route, so this loads it per-document instead.
 *
 * A `<link rel="stylesheet">` with `precedence` is hoisted into `<head>` by
 * React, deduplicated by href, and blocks paint until it resolves, so math is
 * typeset on first paint rather than flashing unstyled. The stylesheet lives in
 * `public/katex.css` (with its fonts under `public/fonts/`) so it is a plain
 * cacheable URL.
 */
export function Mdx({ code, className }: { code: string; className?: string }) {
  const hasMath = /\bkatex\b/.test(code);

  return (
    <div className={className ?? "prose text-spacing-trim"}>
      {hasMath ? (
        /* React hoists this to <head> by `precedence` and dedupes it by href,
           which is the only way to load the stylesheet conditionally; a static
           `import` would ship KaTeX to every MDX page. */
        // eslint-disable-next-line @next/next/no-css-tags
        <link rel="stylesheet" href="/katex.css" precedence="katex" />
      ) : null}
      <MDXContent code={code} components={mdxComponents} />
    </div>
  );
}
