"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navConfig } from "@/src/config/nav";
import { t } from "@/src/i18n";

/**
 * Isolated because `usePathname()` suspends while prerendering a route whose
 * dynamic param is a fallback (not covered by `generateStaticParams`). Keeping
 * it in a `<Suspense>` boundary lets the rest of the header prerender.
 */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="ml-auto hidden items-center gap-1 md:flex">
      {navConfig.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              transitionTypes={["nav-forward"]}
              className={`btn btn-ghost btn-sm ${
                active ? "text-primary" : "font-normal"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {t(item.key)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Static fallback: the same links, none marked active. */
export function NavLinksFallback() {
  return (
    <ul className="ml-auto hidden items-center gap-1 md:flex">
      {navConfig.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            transitionTypes={["nav-forward"]}
            className="btn btn-ghost btn-sm font-normal"
          >
            {t(item.key)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
