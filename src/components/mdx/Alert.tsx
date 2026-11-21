import type { ComponentType, ReactNode, SVGProps } from "react";

import { IconAlert, IconInfo, IconOctagon, IconSpark } from "../atoms/Icons";

type AlertIcon = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<string, AlertIcon> = {
  note: IconInfo,
  tip: IconSpark,
  important: IconInfo,
  warning: IconAlert,
  caution: IconOctagon,
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
  const Glyph = ICONS[type] ?? IconInfo;

  return (
    <div
      role="alert"
      className={`not-prose alert alert-soft ${CLASSES[type] ?? "alert-info"} my-6 items-start`}
    >
      <Glyph className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="text-sm leading-relaxed [&>p]:m-0">{children}</div>
      </div>
    </div>
  );
}
