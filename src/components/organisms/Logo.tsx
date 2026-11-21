import Link from "next/link";

import { siteConfig } from "@/src/config/site";

export function Logo() {
  return (
    <Link href="/" className="text-lg font-semibold tracking-tight">
      {siteConfig.title}
    </Link>
  );
}
