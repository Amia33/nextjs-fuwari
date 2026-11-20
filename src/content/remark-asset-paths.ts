import type { Root } from "mdast";
import { visit } from "unist-util-visit";

import { assetUrl, type AssetCollection } from "./assets";

type Options = {
  collection: AssetCollection;
  slug: string;
  gated: boolean;
};

/**
 * `mdxJsxFlowElement` comes from `mdast-util-mdx-jsx`, which is not part of
 * `@types/mdast`. Only the shape this plugin touches is described here.
 */
type JsxAttribute = {
  type: string;
  name?: string;
  value?: unknown;
};

type JsxElement = { attributes?: JsxAttribute[] };

const SRC_ATTRIBUTES = new Set(["src", "poster"]);

/**
 * Rewrites relative asset references in a document body to the namespace that
 * document's assets actually live in: `/vault/...` when protected, or
 * `/assets/...` when public.
 *
 * Built per document rather than registered globally, because the target path
 * depends on the owning document's collection, slug and gate state.
 */
export function remarkAssetPaths({ collection, slug, gated }: Options) {
  const rewrite = (url: string) => assetUrl(collection, slug, url, gated);

  return () => (tree: Root) => {
    visit(tree, "image", (node) => {
      node.url = rewrite(node.url);
    });

    visit(tree, "definition", (node) => {
      node.url = rewrite(node.url);
    });

    // MDX components take their source as a JSX attribute: `<Audio src="…" />`.
    // Both the block and inline node kinds can carry one.
    visit(tree, (node) => {
      const type: string = node.type;
      if (type !== "mdxJsxFlowElement" && type !== "mdxJsxTextElement") return;
      const element = node as unknown as JsxElement;

      for (const attribute of element.attributes ?? []) {
        if (attribute.type !== "mdxJsxAttribute") continue;
        if (!attribute.name || !SRC_ATTRIBUTES.has(attribute.name)) continue;
        if (typeof attribute.value !== "string") continue;
        attribute.value = rewrite(attribute.value);
      }
    });
  };
}
