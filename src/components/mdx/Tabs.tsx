"use client";

import { Children, useState, type ReactNode } from "react";

export function Tabs({
  items,
  children,
}: {
  items: string[];
  children: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const panels = Children.toArray(children);

  return (
    <div className="not-prose my-6">
      <div role="tablist" className="tabs tabs-box mb-3 w-fit">
        {items.map((label, index) => (
          <button
            key={label}
            role="tab"
            type="button"
            aria-selected={index === active}
            className={`tab ${index === active ? "tab-active" : ""}`}
            onClick={() => setActive(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{panels[active]}</div>
    </div>
  );
}

export function Tab({ children }: { children: ReactNode }) {
  return <div className="text-sm leading-relaxed">{children}</div>;
}
