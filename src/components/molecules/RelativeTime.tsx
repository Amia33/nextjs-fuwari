"use client";

import { useEffect, useState } from "react";

import { formatDate, relativeFormat } from "@/src/i18n";

const MS_PER_DAY = 86_400_000;

function diffInDays(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / MS_PER_DAY);
}

/**
 * `null` until the visitor's clock has been read on the client. Prerendering
 * must never observe the current time, so the first render stays deterministic.
 */
function useDayTick(): Date | null {
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setToday(new Date());
    update();

    const onVisible = () => {
      if (document.visibilityState === "visible") update();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", update);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", update);
    };
  }, []);

  return today;
}

export function DateAgo({ iso }: { iso: string }) {
  const today = useDayTick();

  // Until the client knows "today", show the absolute date. It matches the
  // Suspense fallback used while prerendering, so hydration causes no shift.
  if (!today) return <span>{formatDate(new Date(iso))}</span>;

  const days = diffInDays(new Date(iso), today);

  if (days < 1) return <span>today</span>;
  if (days < 30) return <span>{relativeFormat.format(-days, "day")}</span>;

  const months = Math.round(days / 30);
  if (months < 12) {
    return <span>{relativeFormat.format(-months, "month")}</span>;
  }
  return <span>{relativeFormat.format(-Math.round(days / 365), "year")}</span>;
}

export function DateSpan({ from, to }: { from: string; to: string }) {
  const days = diffInDays(new Date(from), new Date(to));
  if (days < 1) return null;

  if (days < 30) {
    return <span>{relativeFormat.format(-days, "day")}</span>;
  }
  const months = Math.round(days / 30);
  if (months < 12) {
    return <span>{relativeFormat.format(-months, "month")}</span>;
  }
  return <span>{relativeFormat.format(-Math.round(days / 365), "year")}</span>;
}
