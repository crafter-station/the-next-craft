"use client";

import { useTransition } from "react";

import { useTranslations } from "next-intl";

import { setArrival, setMerch } from "@/lib/dashboard/staff-actions";
import type { RosterEntry } from "@/lib/dashboard/staff-roster";
import { cn } from "@/lib/utils";

import { Tag } from "./kit";

/**
 * Una fila de la puerta. Dos botones grandes: se usa de pie, con una mano y
 * con cola detrás.
 */
export function RosterRow({ entry }: { entry: RosterEntry }) {
  const t = useTranslations("dashboard.staff");
  const [pending, start] = useTransition();

  const arrived = Boolean(entry.arrivedAt);
  const merch = Boolean(entry.merchDeliveredAt);

  return (
    <li
      className={cn(
        "flex flex-col gap-3 border-b border-[var(--line)] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
        arrived && "bg-[var(--screen-dim)]",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span
            className={cn(
              "font-mono text-[14px]",
              arrived ? "text-[var(--bright)]" : "text-[var(--text)]",
            )}
          >
            {entry.fullName}
          </span>
          {entry.participantNumber !== null && (
            <span className="font-mono text-[11px] text-[var(--text-dim)]">
              #{String(entry.participantNumber).padStart(3, "0")}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] text-[var(--text-dim)]">
            {entry.email}
          </span>
          {entry.teamName && <Tag>{entry.teamName}</Tag>}
          <Tag strong={entry.hasBadge}>
            {entry.hasBadge ? t("withBadge") : t("noBadge")}
          </Tag>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(() => void setArrival(entry.participantId, !arrived))
          }
          className={cn(
            "min-w-[104px] border px-3 py-2.5 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors disabled:opacity-40",
            arrived
              ? "border-[var(--bone)] bg-[var(--bone)] text-[var(--void)]"
              : "border-[var(--line)] text-[var(--text)] hover:border-[var(--bright)]",
          )}
        >
          {arrived ? t("arrived") : t("markArrival")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(() => void setMerch(entry.participantId, !merch))
          }
          className={cn(
            "min-w-[104px] border px-3 py-2.5 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors disabled:opacity-40",
            merch
              ? "border-[var(--bone)] bg-[var(--bone)] text-[var(--void)]"
              : "border-[var(--line)] text-[var(--text)] hover:border-[var(--bright)]",
          )}
        >
          {merch ? t("merchDone") : t("markMerch")}
        </button>
      </div>
    </li>
  );
}
