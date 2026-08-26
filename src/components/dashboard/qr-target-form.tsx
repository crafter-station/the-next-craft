"use client";

import { useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import { setQrTarget } from "@/lib/dashboard/actions";
import type { QrTargetMode } from "@/lib/db/schema-types";
import { cn } from "@/lib/utils";

import { Basic, keyClass } from "./kit";

/**
 * La credencial se imprime una vez; a dónde apunta su QR se puede cambiar
 * cuantas veces quieras. Esto es el redireccionador.
 */
export function QrTargetForm({
  mode: initialMode,
  customUrl: initialUrl,
  profileUrl,
}: {
  mode: QrTargetMode;
  customUrl: string;
  profileUrl: string | null;
}) {
  const t = useTranslations("dashboard.credential");
  const tErrors = useTranslations("dashboard.errors");
  const [mode, setMode] = useState<QrTargetMode>(initialMode);
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const dirty =
    mode !== initialMode || (mode === "custom" && url.trim() !== initialUrl);

  const options: { mode: QrTargetMode; label: string; hint: string }[] = [
    { mode: "site", label: t("qrModeSite"), hint: t("qrModeSiteHint") },
    {
      mode: "profile",
      label: t("qrModeProfile"),
      hint: profileUrl ? t("qrModeProfileHint") : t("qrModeProfileMissing"),
    },
    { mode: "custom", label: t("qrModeCustom"), hint: t("qrModeCustomHint") },
  ];

  return (
    <div className="px-4 py-3.5">
      <div className="space-y-2.5">
        {options.map((option) => {
          const active = mode === option.mode;
          const disabled = option.mode === "profile" && !profileUrl;
          return (
            <label
              key={option.mode}
              className={cn(
                "flex gap-3 border px-4 py-3 transition-colors",
                disabled
                  ? "cursor-not-allowed border-[var(--line)]/50 opacity-50"
                  : "cursor-pointer",
                active && !disabled
                  ? "border-[var(--bright)]"
                  : "border-[var(--line)]",
              )}
            >
              <input
                type="radio"
                name="qr-target"
                className="sr-only"
                checked={active}
                disabled={disabled}
                onChange={() => {
                  setMode(option.mode);
                  setSaved(false);
                }}
              />
              <span
                className={cn(
                  "mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-full border",
                  active ? "border-[var(--bright)]" : "border-[var(--line)]",
                )}
              >
                {active && (
                  <span className="size-1.5 rounded-full bg-[var(--bright)]" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[13px] text-[var(--text)]">
                  {option.label}
                </span>
                <span className="mt-1 block font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
                  {option.hint}
                </span>
                {option.mode === "profile" && profileUrl && (
                  <span className="mt-1.5 block truncate font-mono text-[11px] text-[var(--text-dim)]">
                    {profileUrl}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {mode === "custom" && (
        <div className="mt-3">
          <Basic n={39}>{t("qrDestination")}</Basic>
          <input
            aria-label={t("qrDestination")}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setSaved(false);
            }}
            placeholder="https://"
            className="mt-2 w-full border border-[var(--line)] bg-[var(--void)] px-3 py-2.5 font-mono text-[13px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:border-[var(--bright)] focus:outline-none"
          />
        </div>
      )}

      {error && (
        <p className="mt-3 font-mono text-[11px] text-[var(--bright)]">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] text-[var(--text-dim)]">
          {saved && !dirty ? t("qrSaved") : dirty ? t("qrDirty") : t("qrClean")}
        </span>
        <button
          type="button"
          className={keyClass}
          disabled={pending || !dirty}
          onClick={() => {
            setError(null);
            setSaved(false);
            start(async () => {
              const res = await setQrTarget(mode, url);
              if (!res.ok) setError(tErrors(res.error));
              else setSaved(true);
            });
          }}
        >
          {t("qrSave")} →
        </button>
      </div>
    </div>
  );
}
