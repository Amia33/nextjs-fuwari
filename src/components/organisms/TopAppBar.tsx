"use client";

import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import { navConfig } from "@/src/config/nav";
import { t } from "@/src/i18n";

import { Logo } from "./Logo";
import { NavLinks, NavLinksFallback } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

let scrolled = false;
const scrollListeners = new Set<() => void>();

function subscribeScrolled(onChange: () => void) {
  scrollListeners.add(onChange);
  const sentinel = document.getElementById("scroll-sentinel");

  const observer = sentinel
    ? new IntersectionObserver(
        ([entry]) => {
          const next = !entry.isIntersecting;
          if (next !== scrolled) {
            scrolled = next;
            for (const listener of scrollListeners) listener();
          }
        },
        { rootMargin: "-64px 0px 0px 0px" },
      )
    : null;
  observer?.observe(sentinel!);

  return () => {
    scrollListeners.delete(onChange);
    observer?.disconnect();
  };
}

function useScrolled(): boolean {
  return useSyncExternalStore(
    subscribeScrolled,
    () => scrolled,
    () => false,
  );
}

export function TopAppBar() {
  const [open, setOpen] = useState(false);
  const isScrolled = useScrolled();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 ${
        isScrolled
          ? "border-b border-base-300 bg-base-100/85 backdrop-blur"
          : "border-b border-transparent"
      }`}
      style={{ viewTransitionName: "site-header" }}
    >
      <nav className="mx-auto flex h-16 w-full max-w-[96rem] items-center gap-4 px-4">
        <Logo />

        <Suspense fallback={<NavLinksFallback />}>
          <NavLinks />
        </Suspense>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle />
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square md:hidden"
            aria-expanded={open}
            aria-label={t("nav.menu")}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </nav>

      {open ? (
        <ul className="border-t border-base-300 bg-base-100 px-4 py-2 md:hidden">
          {navConfig.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block py-2 text-sm"
                transitionTypes={["nav-forward"]}
                onClick={close}
              >
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
