import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Footer } from "@/src/components/organisms/Footer";
import { themeScript } from "@/src/components/organisms/ThemeToggle";
import { TopAppBar } from "@/src/components/organisms/TopAppBar";
import { analyticsConfig } from "@/src/config/analytics";
import { siteConfig } from "@/src/config/site";
import { currentHtmlLang } from "@/src/i18n";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.title}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={currentHtmlLang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-svh flex-col bg-base-100 text-base-content antialiased">
        <div
          id="scroll-sentinel"
          aria-hidden="true"
          className="absolute top-0 h-1 w-full"
        />
        <TopAppBar />
        <main id="content" className="flex-1">
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
          <Footer />
        </main>
        {analyticsConfig.vercel.analytics ? <Analytics /> : null}
        {analyticsConfig.vercel.speedInsights ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
