"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "theme";

export type Theme = "paper" | "ink";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Theme {
  const value = document.documentElement.dataset.theme;
  return value === "ink" ? "ink" : "paper";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "paper" as const,
  );

  function toggle() {
    const next: Theme = getSnapshot() === "paper" ? "ink" : "paper";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode — the theme simply won't persist across visits.
    }
    for (const listener of listeners) listener();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-ghost btn-sm btn-square"
      aria-label="Toggle theme"
      aria-pressed={theme === "ink"}
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {theme === "ink" ? "☾" : "☀"}
      </span>
    </button>
  );
}

export const themeScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="paper"&&t!=="ink"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"ink":"paper";}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="paper";}})();`;
