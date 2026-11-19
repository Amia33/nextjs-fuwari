import type { ReactNode } from "react";

export function Collapse({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="not-prose collapse collapse-arrow my-6 border border-base-300 bg-base-200">
      <summary className="collapse-title cursor-pointer font-medium">
        {title}
      </summary>
      <div className="collapse-content text-sm leading-relaxed">{children}</div>
    </details>
  );
}
