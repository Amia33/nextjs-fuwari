import type { ReactNode } from "react";

export function WidgetLayout({
  name,
  children,
}: {
  name?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-4">
      {name ? (
        <h2 className="mb-2 text-xs font-medium text-subtle">{name}</h2>
      ) : null}
      {children}
    </section>
  );
}
