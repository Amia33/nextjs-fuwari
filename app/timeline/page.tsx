import { timeline } from "@/src/data/timeline";
import { PageShell } from "@/src/components/organisms/PageShell";
import { t } from "@/src/i18n";

export const metadata = { title: t("timeline.title") };

export default function TimelinePage() {
  return (
    <PageShell page="timeline">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("timeline.title")}
        </h1>
        <p className="mt-1 text-sm opacity-60">{t("timeline.description")}</p>
      </header>

      <ol className="relative border-s border-base-300 ps-6">
        {timeline.map((entry) => (
          <li key={entry.date} className="mb-8 last:mb-0">
            <span
              aria-hidden="true"
              className="absolute -start-[5px] mt-1.5 size-2.5 rounded-full bg-primary"
            />
            <time className="text-xs tabular-nums opacity-50">
              {entry.date}
            </time>
            <h2 className="mt-1 font-medium">{entry.title}</h2>
            {entry.description ? (
              <p className="mt-1 text-sm opacity-70">{entry.description}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
