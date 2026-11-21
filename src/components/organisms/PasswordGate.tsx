"use client";

import { useState, useTransition } from "react";

import { t } from "@/src/i18n";
import { unlockContent } from "@/src/server/actions/unlock-content";
import type { GateKind } from "@/src/server/auth/session";

import { IconLock } from "../atoms/Icons";

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
    if (pending) return;
    setError(null);

    startTransition(async () => {
      const result = await unlockContent(kind, id, password);
      if (result.ok) {
        setPassword("");
        return;
      }
      setError(
        result.reason === "bot"
          ? t("gate.bot")
          : result.reason === "throttled"
            ? t("gate.throttled")
            : t("gate.wrong"),
      );
    });
  }

  return (
    <div className="rounded-box border border-base-300 bg-base-200 p-6">
      <h2 className="flex items-center gap-2 text-lg font-medium">
        <IconLock className="size-4" />
        {t("gate.title")}
      </h2>
      <p className="mt-1 text-sm text-muted">{t("gate.description")}</p>

      {hint ? (
        <p className="mt-3 text-sm text-muted">
          {t("gate.hint")}：<span className="font-medium">{hint}</span>
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="w-full sm:max-w-xs">
          <label
            htmlFor="gate-password"
            className="mb-1 block text-sm text-muted"
          >
            {t("gate.label")}
          </label>
          <input
            id="gate-password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            minLength={1}
            maxLength={256}
            value={password}
            onChange={(event) => setPassword(event.target.value.slice(0, 256))}
            placeholder={t("gate.placeholder")}
            className="input input-bordered w-full text-base"
            aria-describedby={error ? "gate-error" : undefined}
            aria-invalid={error ? true : undefined}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? t("gate.submitting") : t("gate.submit")}
        </button>
      </form>

      {error ? (
        <p id="gate-error" role="alert" className="mt-3 text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
