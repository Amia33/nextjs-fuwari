"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { announcementConfig } from "@/src/config/announcement";
import { t } from "@/src/i18n";

import { WidgetLayout } from "./WidgetLayout";

const STORAGE_KEY = "announcement-dismissed";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Private mode — the widget reappears on the next visit.
  }
  for (const listener of listeners) listener();
}

export function AnnouncementWidget() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const { content, link, title, closable } = announcementConfig;
  if (!content || dismissed) return null;

  return (
    <WidgetLayout name={title || t("announcement.title")}>
      <p className="whitespace-pre-line text-sm leading-relaxed opacity-80">
        {content}
      </p>

      {(link.text || closable) && (
        <div className="mt-3 flex items-center justify-between gap-3">
          {link.text ? (
            <Link
              href={link.href}
              transitionTypes={["nav-forward"]}
              className="btn btn-xs"
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.text}
            </Link>
          ) : (
            <span />
          )}

          {closable ? (
            <button
              type="button"
              onClick={dismiss}
              className="btn btn-ghost btn-xs btn-square"
              aria-label={t("announcement.close")}
            >
              <span aria-hidden="true">✕</span>
            </button>
          ) : null}
        </div>
      )}
    </WidgetLayout>
  );
}
