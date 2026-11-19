import "server-only";

import { Mdx } from "@/src/components/molecules/Mdx";
import { PasswordGate } from "@/src/components/organisms/PasswordGate";
import { getGate } from "@/src/server/auth/gate";
import { isUnlocked } from "@/src/server/auth/session";

export async function ProtectedBody({
  kind,
  id,
  code,
  html,
}: {
  kind: "post" | "moment" | "album";
  id: string;
  code: string;
  html?: React.ReactNode;
}) {
  const gate = getGate(kind, id);

  if (!gate) return html ?? <Mdx code={code} />;

  const unlocked = await isUnlocked(kind, id);
  if (!unlocked) return <PasswordGate kind={kind} id={id} hint={gate.hint} />;

  return html ?? <Mdx code={code} />;
}
