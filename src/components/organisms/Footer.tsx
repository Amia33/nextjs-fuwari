import { profileConfig } from "@/src/config/profile";
import { siteConfig } from "@/src/config/site";
import { t } from "@/src/i18n";

/**
 * Rendered inside the content column, so it aligns to the reading measure
 * instead of spanning the full page width.
 */
export function Footer() {
  return (
    <footer className="mt-16 border-t border-base-300 py-8 text-center text-sm text-muted">
      <p>
        © {siteConfig.title} · {profileConfig.name}
      </p>
      <p className="mt-2 text-xs text-subtle">{t("footer.poweredBy")}</p>
    </footer>
  );
}
