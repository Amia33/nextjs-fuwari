import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { themeScript } from "@/src/components/organisms/ThemeToggle";
import { TopAppBar } from "@/src/components/organisms/TopAppBar";
import { analyticsConfig } from "@/src/config/analytics";
import { siteConfig } from "@/src/config/site";
import { currentHtmlLang, t } from "@/src/i18n";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.title}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  // Pages override these through `pageMetadata()`. The defaults keep a route
  // that sets nothing (or sets only a title) from shipping bare social tags.
  openGraph: {
    type: "website",
    siteName: siteConfig.title,
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    images: [{ url: siteConfig.banner.src, width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.banner.src],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={currentHtmlLang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-svh flex-col bg-base-100 text-base-content antialiased">
        <a
          href="#content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-[60] focus-visible:rounded-box focus-visible:border focus-visible:border-base-300 focus-visible:bg-base-100 focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:text-base-content"
        >
          {t("nav.skipToContent")}
        </a>
        <div
          id="scroll-sentinel"
          aria-hidden="true"
          className="absolute top-0 h-1 w-full"
        />
        <TopAppBar />
        {/* Pages own the <main> region so the footer can sit inside the
            content column while the sidebars flank it. */}
        <div className="flex-1">
          <ViewTransition
            enter={{
              "nav-forward": "nav-forward",
              "nav-back": "nav-back",
              default: "none",
            }}
            exit={{
              "nav-forward": "nav-forward",
              "nav-back": "nav-back",
              default: "none",
            }}
            default="none"
          >
            {children}
          </ViewTransition>
        </div>
        {analyticsConfig.vercel.analytics ? <Analytics /> : null}
        {analyticsConfig.vercel.speedInsights ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
