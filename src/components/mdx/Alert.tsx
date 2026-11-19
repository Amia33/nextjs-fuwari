import type { ReactNode } from "react";

const ICONS: Record<string, string> = {
  note: "ℹ",
  tip: "✦",
  important: "❗",
  warning: "⚠",
  caution: "⚠",
};

const CLASSES: Record<string, string> = {
  note: "alert-info",
  tip: "alert-success",
  important: "alert-info",
  warning: "alert-warning",
  caution: "alert-error",
};

export type AlertType = "note" | "tip" | "important" | "warning" | "caution";

export function Alert({
  type = "note",
  title,
  children,
}: {
  type?: AlertType;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="alert"
      className={`not-prose alert alert-soft ${CLASSES[type] ?? "alert-info"} my-6 items-start`}
    >
      <span aria-hidden="true" className="mt-0.5 text-base">
        {ICONS[type] ?? "ℹ"}
      </span>
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="text-sm leading-relaxed [&>p]:m-0">{children}</div>
      </div>
    </div>
  );
}
