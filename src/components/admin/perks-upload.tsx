"use client";

import { useRef, useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import { uploadPerkCodes } from "@/lib/admin/perks-actions";
import { cn } from "@/lib/utils";

import { Basic, keyClass, Panel, Pixel } from "@/components/dashboard/kit";

export function PerksUpload() {
  const t = useTranslations("admin.perks");
  const [result, setResult] = useState<{
    assigned: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    start(async () => {
      const text = await file.text();
      const response = await uploadPerkCodes(text);
      if (!response.ok) {
        setResult({
          assigned: 0,
          skipped: 0,
          errors: [t(`errors.${response.error}`)],
        });
        return;
      }
      setResult(response);
      if (fileRef.current) fileRef.current.value = "";
    });
  };

  return (
    <Panel className="px-4 py-4 sm:px-5 sm:py-5">
      <Basic n={20}>{t("uploadLabel")}</Basic>
      <Pixel size="md" className="mt-2">
        {t("uploadTitle")}
      </Pixel>
      <p className="mt-2 font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
        {t("uploadBody")}
      </p>

      <pre className="mt-4 overflow-x-auto border border-[var(--line)] bg-[var(--void)] px-3 py-2.5 font-mono text-[11px] text-[var(--text-dim)]">
        {t("csvExample")}
      </pre>

      <form
        onSubmit={onSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="min-w-0 flex-1 border border-[var(--line)] bg-[var(--void)] px-3 py-2.5 font-mono text-[12px] text-[var(--text)] file:mr-3 file:border-0 file:bg-transparent file:font-mono file:text-[11px] file:tracking-[0.1em] file:uppercase file:text-[var(--bright)]"
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(keyClass, "px-5 py-2.5 disabled:opacity-40")}
        >
          {pending ? t("uploading") : t("uploadCta")}
        </button>
      </form>

      {result && (
        <div className="mt-4 border border-[var(--line)] bg-[var(--void)] px-3 py-3">
          <p className="font-mono text-[12px] text-[var(--bright)]">
            {t("resultSummary", {
              assigned: result.assigned,
              skipped: result.skipped,
            })}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.errors.map((error) => (
                <li
                  key={error}
                  className="font-mono text-[11px] text-[var(--text-dim)]"
                >
                  · {error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Panel>
  );
}
