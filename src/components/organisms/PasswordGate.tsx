"use client";

import { useState, useTransition } from "react";

import { t } from "@/src/i18n";
import { unlockContent } from "@/src/server/actions/unlock-content";
import type { GateKind } from "@/src/server/auth/session";

export function PasswordGate({
  kind,
  id,
  hint,
}: {
  kind: GateKind;
  id: string;
  hint?: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await unlockContent(kind, id, password);
      if (result.ok) {
        setPassword("");
        return;
      }
      setError(
        result.reason === "throttled" ? t("gate.throttled") : t("gate.wrong"),
      );
    });
  }

  return (
    <div className="rounded-box border border-base-300 bg-base-200 p-6">
      <h2 className="text-lg font-medium">
        <span aria-hidden="true">🔒 </span>
        {t("gate.title")}
      </h2>
      <p className="mt-1 text-sm opacity-70">{t("gate.description")}</p>

      {hint ? (
        <p className="mt-3 text-sm opacity-70">
          {t("gate.hint")}：<span className="font-medium">{hint}</span>
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t("gate.placeholder")}
          className="input input-bordered w-full sm:max-w-xs"
          aria-label={t("gate.placeholder")}
          aria-invalid={error ? true : undefined}
        />
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? t("gate.submitting") : t("gate.submit")}
        </button>
      </form>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
