import { PostIndex } from "@/src/components/organisms/PostIndex";
import { pageMetadata } from "@/src/lib/metadata";

export const metadata = pageMetadata({ path: "/" });

export default function HomePage() {
  return <PostIndex page={1} />;
}
