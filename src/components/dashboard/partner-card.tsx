"use client";

import { useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import { redeemPartner } from "@/lib/dashboard/actions";
import type { Partner } from "@/lib/dashboard/content";

import { Link } from "@/i18n/navigation";
import { Basic, keyClass, keyGhostClass, Panel, Pixel, Tag } from "./kit";

export function PartnerCard({
  partner,
  index,
  code,
  redeemed,
  detailed = false,
}: {
  partner: Partner;
  index: number;
  code: string | null;
  redeemed: boolean;
  detailed?: boolean;
}) {
  const t = useTranslations("dashboard");
  const [revealed, setRevealed] = useState(redeemed);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const [redeemError, setRedeemError] = useState<string | null>(null);

  const steps = Array.from({ length: partner.steps }, (_, i) =>
    t(`credits.partners.${partner.key}.steps.${i}`),
  );

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Panel as="article" screen={revealed} className="flex flex-col">
      <header className="border-b border-[var(--line)] px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <Basic n={70 + index}>{`partner 0${index}`}</Basic>
          <Tag strong={partner.perParticipant}>
            {partner.perParticipant
              ? t("credits.perParticipant")
              : t("credits.perTeam")}
          </Tag>
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            {detailed ? (
              <Pixel size="lg">{partner.name}</Pixel>
            ) : (
              <Link href={`/dashboard/credits/${partner.key}`}>
                <Pixel size="md">{partner.name}</Pixel>
              </Link>
            )}
            <p className="mt-1.5 font-mono text-[12px] text-[var(--text-dim)]">
              {t(`credits.partners.${partner.key}.perk`)}
            </p>
          </div>
          <Pixel size="md" className="shrink-0">
            ${partner.valueUsd}
          </Pixel>
        </div>
      </header>

      <div className="flex-1 px-4 py-3.5">
        <p className="font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
          {t(`credits.partners.${partner.key}.about`)}
        </p>

        <p className="mt-5 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
          {t("credits.howLabel")}
        </p>
        <ol className="mt-2.5 space-y-1.5">
          {steps.map((step, i) => (
            <li
              key={step}
              className="flex gap-2.5 font-mono text-[12px] leading-relaxed text-[var(--text-dim)]"
            >
              <span className="text-[var(--bright)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="border-t border-[var(--line)] px-4 py-3.5">
        {!code ? (
          <>
            <Basic n={79}>{t("credits.codePendingLabel")}</Basic>
            <p className="mt-2.5 font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
              {t("credits.codePendingBody")}
            </p>
          </>
        ) : revealed ? (
          <>
            <Basic n={79}>{t("credits.yourCode")}</Basic>
            <button
              type="button"
              onClick={copy}
              className="mt-2.5 flex w-full items-center justify-between gap-3 border border-dashed border-[var(--line)] px-3 py-3 text-left transition-colors hover:border-[var(--bright)]"
            >
              <span className="truncate font-mono text-[13px] tracking-[0.08em] text-[var(--bright)]">
                {code}
              </span>
              <span className="shrink-0 font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--text-dim)]">
                {copied ? t("credits.copied") : t("credits.copy")}
              </span>
            </button>
          </>
        ) : (
          <>
            <Basic n={79}>{t("credits.codeHidden")}</Basic>
            <button
              type="button"
              className={`${keyClass} mt-2.5 w-full`}
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setRedeemError(null);
                  const result = await redeemPartner(partner.key);
                  if (!result.ok) {
                    setRedeemError(t(`errors.${result.error}`));
                    return;
                  }
                  setRevealed(true);
                })
              }
            >
              {t("credits.redeem")} →
            </button>
            {redeemError && (
              <p className="mt-2 font-mono text-[11px] text-[var(--text-dim)]">
                {redeemError}
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] px-4 py-3">
        <span className="font-mono text-[10px] text-[var(--text-dim)]">
          {t("credits.expires")}
        </span>
        <a
          href={partner.url}
          target="_blank"
          rel="noreferrer"
          className={keyGhostClass}
        >
          {t("credits.openPanel")} →
        </a>
      </div>
    </Panel>
  );
}
