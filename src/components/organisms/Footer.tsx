import Link from "next/link";

import { articleConfig } from "@/src/config/article";
import { profileConfig } from "@/src/config/profile";
import { siteConfig } from "@/src/config/site";
import { t } from "@/src/i18n";

export function Footer() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-3xl border-t border-base-300 px-4 py-8 text-center text-sm opacity-70">
      <p>
        © {siteConfig.title} · {profileConfig.name}
      </p>
      <p className="mt-2">
        <Link
          href="/rss.xml"
          className="link link-hover"
          transitionTypes={["nav-forward"]}
        >
          {t("feed.rss")}
        </Link>
        {" · "}
        <Link
          href="/atom.xml"
          className="link link-hover"
          transitionTypes={["nav-forward"]}
        >
          {t("feed.atom")}
        </Link>
        {" · "}
        <a
          href={articleConfig.license.href}
          target="_blank"
          rel="noopener noreferrer"
          className="link link-hover"
        >
          {articleConfig.license.name}
        </a>
      </p>
      <p className="mt-2 text-xs">{siteConfig.title}</p>
    </footer>
  );
}
