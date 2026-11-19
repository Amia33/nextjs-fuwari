import { MDXContent } from "@content-collections/mdx/react";
import { mdxComponents } from "@/src/components/mdx";

export function Mdx({ code, className }: { code: string; className?: string }) {
  return (
    <div className={className ?? "prose text-spacing-trim"}>
      <MDXContent code={code} components={mdxComponents} />
    </div>
  );
}
