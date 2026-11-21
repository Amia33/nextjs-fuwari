"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import { currentHtmlLang, t } from "@/src/i18n";
import type { CalendarPost } from "@/src/content/calendar";

import { WidgetLayout } from "./WidgetLayout";

// Weekday headers follow the site locale, Monday-first like the upstream.
const WEEKDAYS = Array.from({ length: 7 }, (_, index) => {
  // 2024-01-01 was a Monday — a fixed reference week keeps this deterministic.
  const date = new Date(Date.UTC(2024, 0, 1 + index));
  return new Intl.DateTimeFormat(currentHtmlLang, {
    weekday: "narrow",
    timeZone: "UTC",
  }).format(date);
});

const MONTH_LABEL = new Intl.DateTimeFormat(currentHtmlLang, {
  year: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** Full date for a day's accessible name, e.g. "2026年11月15日". */
const DAY_LABEL = new Intl.DateTimeFormat(currentHtmlLang, {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/** `dateKey` is `YYYY-MM-DD`; UTC keeps the label on the same calendar day. */
function dayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return DAY_LABEL.format(new Date(Date.UTC(year, month - 1, day)));
}

const pad = (value: number) => String(value).padStart(2, "0");

/** Local calendar day as `YYYY-MM-DD`, in the visitor's own timezone. */
function localToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const noopSubscribe = () => () => {};

/**
 * The visitor's current day, resolved after hydration.
 *
 * The server snapshot is `null`, so prerendered markup stays deterministic;
 * React re-renders with the real value immediately after hydration without a
 * mismatch. Reading it inside an effect and calling `setState` would do the
 * same thing less safely.
 */
function useToday(): string | null {
  return useSyncExternalStore(noopSubscribe, localToday, () => null);
}

type Cell = { key: string; day: number; dateKey: string } | null;

function monthCells(month: string): Cell[] {
  const [year, monthIndex] = month.split("-").map(Number);
  const firstWeekday =
    (new Date(Date.UTC(year, monthIndex - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();

  const cells: Cell[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${month}-${pad(day)}`;
    cells.push({ key: dateKey, day, dateKey });
  }
  return cells;
}

function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

export function CalendarWidget({
  postsByDate,
  initialMonth,
}: {
  postsByDate: Record<string, CalendarPost[]>;
  initialMonth?: string;
}) {
  // `null` means "follow the visitor's current month", as upstream does.
  // Prerendering has no "today", so it falls back to the newest month that
  // actually has posts.
  const today = useToday();
  const [month, setMonth] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const displayMonth = month ?? today?.slice(0, 7) ?? initialMonth;
  const cells = useMemo(
    () => (displayMonth ? monthCells(displayMonth) : []),
    [displayMonth],
  );

  if (!displayMonth) return null;

  const monthLabel = MONTH_LABEL.format(
    new Date(
      Date.UTC(
        Number(displayMonth.slice(0, 4)),
        Number(displayMonth.slice(5, 7)) - 1,
        1,
      ),
    ),
  );
  const selectedPosts = selected ? (postsByDate[selected] ?? []) : [];

  return (
    <WidgetLayout name={t("calendar.title")}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-square"
          aria-label={t("calendar.prevMonth")}
          onClick={() => {
            setSelected(null);
            setMonth(shiftMonth(displayMonth, -1));
          }}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <p className="text-sm font-medium tabular-nums">{monthLabel}</p>
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-square"
          aria-label={t("calendar.nextMonth")}
          onClick={() => {
            setSelected(null);
            setMonth(shiftMonth(displayMonth, 1));
          }}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[0.6875rem] opacity-50">
        {WEEKDAYS.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (!cell) return <span key={`empty-${index}`} />;

          const hasPosts = Boolean(postsByDate[cell.dateKey]?.length);
          const isToday = today === cell.dateKey;
          const isSelected = selected === cell.dateKey;
          const count = postsByDate[cell.dateKey]?.length ?? 0;
          // Days with nothing on them stay clickable but leave the tab order:
          // a bare digit is not a useful tab stop, and 30 of them per page made
          // the keyboard unobtainable before the content.
          const reachable = hasPosts || isToday || isSelected;

          return (
            <button
              key={cell.key}
              type="button"
              data-has-posts={hasPosts || undefined}
              data-today={isToday || undefined}
              data-selected={isSelected || undefined}
              aria-label={
                count > 0
                  ? t("calendar.dayWithPosts", {
                      date: dayLabel(cell.dateKey),
                      count,
                    })
                  : t("calendar.dayLabel", { date: dayLabel(cell.dateKey) })
              }
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              tabIndex={reachable ? 0 : -1}
              onClick={() =>
                setSelected((current) =>
                  current === cell.dateKey ? null : cell.dateKey,
                )
              }
              className="relative aspect-square rounded text-xs tabular-nums transition-colors hover:bg-base-200 data-[today]:bg-primary/15 data-[today]:font-semibold data-[today]:text-primary data-[selected]:bg-primary data-[selected]:text-primary-content"
            >
              {cell.day}
              {hasPosts ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-1 mx-auto size-1 rounded-full bg-primary"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-3 border-t border-base-300 pt-2 text-sm">
        {/* Announced when the selection changes, so the result of clicking a
            day is not a visual-only update. */}
        <div aria-live="polite">
          {selected ? (
            selectedPosts.length > 0 ? (
              <ul className="space-y-1">
                {selectedPosts.map((post) => (
                  <li key={post.href}>
                    <Link
                      href={post.href}
                      transitionTypes={["nav-forward"]}
                      className="block truncate hover:text-primary"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs opacity-50">{t("calendar.noPosts")}</p>
            )
          ) : null}
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-xs mt-1 w-full"
          onClick={() => {
            // Resetting the override makes the grid follow the visitor's
            // current month again, with today highlighted.
            setMonth(null);
            setSelected(null);
          }}
        >
          {t("calendar.today")}
        </button>
      </div>
    </WidgetLayout>
  );
}
