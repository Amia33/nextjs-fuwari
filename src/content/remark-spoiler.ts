import type { Root, Text, PhrasingContent } from "mdast";
import { visit } from "unist-util-visit";

const SPOILER = /\|\|([^|\n]+?)\|\|/g;

export function remarkSpoiler() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (index === null || index === undefined || !parent) return;

      const value = node.value;
      SPOILER.lastIndex = 0;
      if (!SPOILER.test(value)) return;
      SPOILER.lastIndex = 0;

      const children: PhrasingContent[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = SPOILER.exec(value)) !== null) {
        if (match.index > lastIndex) {
          children.push({
            type: "text",
            value: value.slice(lastIndex, match.index),
          });
        }
        children.push({
          type: "emphasis",
          data: {
            hName: "span",
            hProperties: { className: ["spoiler"], "data-spoiler": "true" },
          },
          children: [{ type: "text", value: match[1] }],
        });
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < value.length) {
        children.push({ type: "text", value: value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...children);
      return index + children.length;
    });
  };
}
