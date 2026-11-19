import type { Heading } from "@/src/content/headings";
import { TocWidget } from "@/src/components/widgets/TocWidget";
import { getGate } from "@/src/server/auth/gate";
import { isUnlocked } from "@/src/server/auth/session";

/**
 * Table of contents for a post, withheld until the post is unlocked.
 *
 * The headings are derived from the post's markdown, which the gate hides. The
 * sidebar sits outside `ProtectedBody`, so rendering the TOC unconditionally
 * would publish the headings of a locked post — the section titles alone can
 * give the article away. Checking the cookie here keeps the list in step with
 * the body: both appear together, and neither before the password is entered.
 *
 * This reads cookies, so callers must render it inside a `<Suspense>` boundary.
 */
export async function PostToc({
  id,
  headings,
}: {
  id: string;
  headings: Heading[];
}) {
  if (getGate("post", id) && !(await isUnlocked("post", id))) return null;

  return <TocWidget headings={headings} />;
}
