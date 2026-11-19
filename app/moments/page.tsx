import { Suspense } from "react";

import { MomentCard } from "@/src/components/molecules/MomentCard";
import { PageShell } from "@/src/components/organisms/PageShell";
import { PhotoSwipeProvider } from "@/src/components/organisms/PhotoSwipeProvider";
import { getMoments } from "@/src/content/moments";
import { t } from "@/src/i18n";
import { isUnlocked } from "@/src/server/auth/session";

export const metadata = { title: t("moments.title") };

// The gate reads cookies, which is request data.
export const instant = false;

/**
 * One `<Suspense>` boundary for every body on the page: the unlock state is
 * resolved once and passed to each card, instead of one cookie read per card.
 */
async function MomentBodies() {
  const moments = getMoments();

  const unlocked = await Promise.all(
    moments.map((moment) =>
      moment.passwordProtected
        ? isUnlocked("moment", moment._meta.path)
        : Promise.resolve(true),
    ),
  );

  return (
    <div className="space-y-4">
      {moments.map((moment, index) => (
        <MomentCard
          key={moment._meta.path}
          moment={moment}
          unlocked={unlocked[index]}
        />
      ))}
    </div>
  );
}

export default function MomentsPage() {
  return (
    <PageShell
      page="moments"
      bannerTitle={t("moments.title")}
      bannerDescription={t("moments.description")}
    >
      <Suspense
        fallback={
          <p className="py-8 text-sm opacity-60">{t("common.loading")}</p>
        }
      >
        <MomentBodies />
      </Suspense>

      <PhotoSwipeProvider />
    </PageShell>
  );
}
