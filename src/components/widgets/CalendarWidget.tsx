"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

type Cell = { key: string; day: number; dateKey: string } | null;

function monthCells(month: string): Cell[] {
  const [year, monthIndex] = month.split("-").map(Number);
  const firstWeekday =
    (new Date(Date.UTC(year, monthIndex - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();

  const cells: Cell[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${month}-${String(day).padStart(2, "0")}`;
    cells.push({ key: dateKey, day, dateKey });
  }
  return cells;
}

function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function CalendarWidget({
  postsByDate,
  initialMonth,
}: {
  postsByDate: Record<string, CalendarPost[]>;
  initialMonth?: string;
}) {
  // The initial month comes from build data, so the prerendered calendar is
  // deterministic. "Today" is only consulted on demand, inside the button
  // handler, which keeps the server and client markup identical.
  const [month, setMonth] = useState(initialMonth ?? "");
  const [selected, setSelected] = useState<string | null>(null);
  const cells = useMemo(() => (month ? monthCells(month) : []), [month]);

  if (!month) return null;

  const monthLabel = MONTH_LABEL.format(
    new Date(
      Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1),
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
            setMonth((current) => shiftMonth(current, -1));
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
            setMonth((current) => shiftMonth(current, 1));
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
          const isSelected = selected === cell.dateKey;

          return (
            <button
              key={cell.key}
              type="button"
              data-has-posts={hasPosts || undefined}
              data-selected={isSelected || undefined}
              onClick={() =>
                setSelected((current) =>
                  current === cell.dateKey ? null : cell.dateKey,
                )
              }
              className="relative aspect-square rounded text-xs tabular-nums transition-colors hover:bg-base-200 data-[selected]:bg-primary data-[selected]:text-primary-content"
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
        <button
          type="button"
          className="btn btn-ghost btn-xs mt-1 w-full"
          onClick={() => {
            const now = new Date();
            setSelected(null);
            setMonth(
              `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
            );
          }}
        >
          {t("calendar.today")}
        </button>
      </div>
    </WidgetLayout>
  );
}
