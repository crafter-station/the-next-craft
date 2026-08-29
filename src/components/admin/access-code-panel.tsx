"use client";

import { useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import { rotateAccessCode } from "@/lib/judging/actions";

import { Panel, PanelHead, Pixel } from "@/components/dashboard/kit";

import { useRouter } from "@/i18n/navigation";

/**
 * El código del panel, en grande.
 *
 * Es lo que el staff escribe en la pizarra o dicta a la sala, así que ocupa su
 * propio bloque y no una línea perdida en una tabla: si hay que buscarlo, no
 * sirve.
 */
export function AccessCodePanel({ code }: { code: string }) {
  const t = useTranslations("admin.judging");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  return (
    <Panel className="mb-5">
      <PanelHead n={5} label={t("codeLabel")} title={t("codeTitle")} />
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-5">
        <Pixel size="xl" className="tracking-[0.12em] tabular-nums">
          {code.slice(0, 4)}-{code.slice(4)}
        </Pixel>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(
                `${code.slice(0, 4)}-${code.slice(4)}`,
              );
              setCopied(true);
            }}
            className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--text-dim)] underline underline-offset-4 hover:text-[var(--bright)]"
          >
            {copied ? t("codeCopied") : t("codeCopy")}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await rotateAccessCode();
                setCopied(false);
                router.refresh();
              })
            }
            className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--text-dim)] underline underline-offset-4 hover:text-[var(--destructive)] disabled:opacity-40"
          >
            {t("codeRotate")}
          </button>
        </div>
      </div>
      <p className="border-t border-[var(--line)] px-4 py-3 font-mono text-[11px] leading-relaxed text-[var(--text-dim)]">
        {t("codeNote")}
      </p>
    </Panel>
  );
}
