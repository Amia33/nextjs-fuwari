import type { Pluggable } from "unified";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExpressiveCode from "rehype-expressive-code";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { remarkSpoiler } from "./remark-spoiler";

export const remarkPlugins: Pluggable[] = [
  remarkGfm,
  remarkMath,
  remarkSpoiler,
];

export const rehypePlugins: Pluggable[] = [
  rehypeKatex,
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    { behavior: "wrap", properties: { className: ["heading-anchor"] } },
  ],
  [
    rehypeExpressiveCode,
    {
      themes: ["one-light", "one-dark-pro"],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme: { name: string }) =>
        theme.name === "one-dark-pro"
          ? '[data-theme="ink"]'
          : '[data-theme="paper"]',
      styleOverrides: {
        borderRadius: "0.5rem",
        codeFontSize: "0.875rem",
        uiFontSize: "0.8125rem",
      },
    },
  ],
  [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
];
