import { FeedLanding } from "@/src/components/organisms/FeedLanding";
import { t } from "@/src/i18n";

export const metadata = { title: t("feed.title") };

export default function RssLandingPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <FeedLanding />
    </div>
  );
}
