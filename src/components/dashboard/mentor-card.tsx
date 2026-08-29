"use client";

import { useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import {
  assignMentorTable,
  bookMentorSlot,
  cancelMentorSlot,
  releaseMentorTable,
} from "@/lib/dashboard/actions";
import type { MentorTableView } from "@/lib/dashboard/state";
import { cn } from "@/lib/utils";

import { Basic, keyClass, keyGhostClass, Panel, Pixel, Tag } from "./kit";

export function MentorCard({
  table,
  index,
  isMyTable,
  hasTeam,
}: {
  table: MentorTableView;
  index: number;
  isMyTable: boolean;
  hasTeam: boolean;
}) {
  const t = useTranslations("dashboard");
  const [slotId, setSlotId] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const free = table.slots.filter((s) => !s.taken).length;
  const mine = table.slots.filter((s) => s.takenByMyTeam);
  const tableFull = table.teamsAssigned >= table.teamCapacity;

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok && res.error) setError(t(`errors.${res.error}`));
      else {
        setSlotId(null);
        setTopic("");
      }
    });
  };

  return (
    <Panel
      as="article"
      screen={isMyTable}
      className={cn("flex flex-col", isMyTable && "border-[var(--bright)]")}
    >
      <header className="border-b border-[var(--line)] px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <Basic n={50 + index}>{`mesa 0${index}`}</Basic>
          <div className="flex gap-1.5">
            {isMyTable && <Tag strong>{t("mentors.myTable")}</Tag>}
            <Tag>
              {free > 0
                ? t("mentors.freeCount", { count: free })
                : t("mentors.noSlots")}
            </Tag>
          </div>
        </div>
        <Pixel size="md" className="mt-3">
          {table.org}
        </Pixel>
        <p className="mt-1.5 font-mono text-[12px] text-[var(--text-dim)]">
          {t(`mentors.roles.${table.role}`)}
        </p>
      </header>

      {table.bio && (
        <div className="flex-1 px-4 py-3.5">
          <p className="font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
            {table.bio}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {table.expertise.map((e) => (
              <Tag key={e}>{e}</Tag>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-[var(--line)] px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-[var(--text-dim)]">
            {t("mentors.teamsAssigned", {
              assigned: table.teamsAssigned,
              capacity: table.teamCapacity,
            })}
          </span>
          <button
            type="button"
            className={isMyTable ? keyGhostClass : keyClass}
            disabled={pending || !hasTeam || (tableFull && !isMyTable)}
            onClick={() =>
              run(() =>
                isMyTable ? releaseMentorTable() : assignMentorTable(table.id),
              )
            }
          >
            {isMyTable
              ? t("mentors.releaseTable")
              : tableFull
                ? t("mentors.tableFull")
                : t("mentors.chooseTable")}
          </button>
        </div>
      </div>

      {mine.length > 0 && (
        <div className="border-t border-[var(--line)] px-4 py-3">
          <Basic n={59}>{t("mentors.myBookingsLabel")}</Basic>
          <p className="mt-1.5 font-mono text-[12px] text-[var(--bright)]">
            {mine.map((s) => `${s.startsAt}–${s.endsAt}`).join(" · ")}
          </p>
        </div>
      )}

      <div className="border-t border-[var(--line)] px-4 py-3.5">
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
          {t("mentors.slotsLabel")}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {table.slots.map((s) => {
            const active = slotId === s.id;
            const locked = s.taken && !s.takenByMyTeam;
            return (
              <button
                key={s.id}
                type="button"
                disabled={locked || pending || !hasTeam}
                onClick={() => {
                  if (s.takenByMyTeam) {
                    run(() => cancelMentorSlot(s.id));
                    return;
                  }
                  setSlotId(active ? null : s.id);
                }}
                className={cn(
                  "border px-2 py-1 font-mono text-[11px] tabular-nums transition-colors disabled:cursor-not-allowed",
                  s.takenByMyTeam &&
                    "border-[var(--bone)] bg-[var(--bone)] text-[var(--void)]",
                  locked &&
                    "border-[var(--line)]/50 text-[var(--text-dim)] line-through opacity-50",
                  !locked &&
                    !s.takenByMyTeam &&
                    active &&
                    "border-[var(--bright)] text-[var(--bright)]",
                  !locked &&
                    !s.takenByMyTeam &&
                    !active &&
                    "border-[var(--line)] text-[var(--text)] hover:text-[var(--bright)]",
                )}
              >
                {s.startsAt}
              </button>
            );
          })}
        </div>

        {slotId && (
          <div className="mt-3.5 border border-[var(--line)] p-3.5">
            <label
              htmlFor={`topic-${table.id}`}
              className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]"
            >
              {t("mentors.topicLabel")}
            </label>
            <textarea
              id={`topic-${table.id}`}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder={t("mentors.topicPlaceholder")}
              className="mt-2.5 w-full resize-none border border-[var(--line)] bg-[var(--void)] px-3 py-2.5 font-mono text-[12px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:border-[var(--bright)] focus:outline-none"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] text-[var(--text-dim)]">
                {t("mentors.chars", { count: topic.trim().length })}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={keyGhostClass}
                  onClick={() => setSlotId(null)}
                >
                  {t("mentors.cancel")}
                </button>
                <button
                  type="button"
                  className={keyClass}
                  disabled={pending || topic.trim().length < 10}
                  onClick={() => run(() => bookMentorSlot(slotId, topic))}
                >
                  {t("mentors.book")} →
                </button>
              </div>
            </div>
            {topic.trim().length < 10 && (
              <p className="mt-2 font-mono text-[10px] text-[var(--text-dim)]">
                {t("mentors.topicHint")}
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="mt-2.5 font-mono text-[11px] text-[var(--bright)]">
            {error}
          </p>
        )}
      </div>
    </Panel>
  );
}
