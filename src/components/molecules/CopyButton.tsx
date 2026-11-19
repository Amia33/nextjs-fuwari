"use client";

import { useState } from "react";

import { t } from "@/src/i18n";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className="btn btn-sm" onClick={copy}>
      {copied ? t("feed.copied") : t("feed.copy")}
    </button>
  );
}
