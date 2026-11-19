import { MomentCard } from "@/src/components/molecules/MomentCard";
import { getMoments } from "@/src/content/moments";
import { t } from "@/src/i18n";

export const metadata = { title: t("moments.title") };

export default function MomentsPage() {
  const moments = getMoments();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("moments.title")}
        </h1>
        <p className="mt-1 text-sm opacity-60">{t("moments.description")}</p>
      </header>

      {moments.length === 0 ? (
        <p className="py-12 text-center text-sm opacity-60">
          {t("moments.empty")}
        </p>
      ) : (
        <div className="space-y-4">
          {moments.map((moment) => (
            <MomentCard key={moment._meta.path} moment={moment} />
          ))}
        </div>
      )}
    </div>
  );
}
