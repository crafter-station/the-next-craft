"use client";

import { useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import {
  confirmTrack,
  releaseTrack,
  selectTrack,
} from "@/lib/dashboard/actions";
import { TRACKS } from "@/lib/dashboard/content";
import type { TrackKey } from "@/lib/db/schema-types";
import { cn } from "@/lib/utils";

import { Basic, keyClass, keyGhostClass, Panel, Pixel, Tag } from "./kit";

export type TrackCard = {
  key: TrackKey;
  id: string;
  name: string;
  tagline: string;
  desc: string;
  ideas: string[];
  why: string;
  teams: number;
  /** Equipos que admite este track en la sede del hacker; `null` si no hay tope. */
  capacity: number | null;
};

export function TrackDeck({
  tracks,
  selected,
  confirmed,
  ideasLabel,
}: {
  tracks: TrackCard[];
  selected: TrackKey | null;
  confirmed: boolean;
  ideasLabel: string;
}) {
  const t = useTranslations("dashboard");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok && res.error) setError(t(`errors.${res.error}`));
    });
  };

  const current = tracks.find((tr) => tr.key === selected) ?? null;

  return (
    <>
      <div className="grid items-start gap-5 lg:grid-cols-3">
        {tracks.map((track, i) => {
          const isSelected = track.key === selected;
          return (
            <Panel
              key={track.key}
              as="article"
              screen={isSelected}
              className={cn(
                "flex flex-col transition-colors",
                isSelected
                  ? "border-[var(--bright)]"
                  : "hover:border-[var(--text-dim)]",
              )}
            >
              <header className="border-b border-[var(--line)] px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <Basic n={30 + i}>{`track ${track.id} — 03`}</Basic>
                  {isSelected && (
                    <Tag strong>
                      {confirmed
                        ? t("tracks.confirmedBadge")
                        : t("tracks.chosen")}
                    </Tag>
                  )}
                </div>
                <p className="mt-3 font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--text-dim)]">
                  {track.tagline}
                </p>
                <Pixel size="lg" className="mt-2">
                  {track.name}
                </Pixel>
              </header>

              <div className="flex-1 px-4 py-3.5">
                <p className="font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
                  {track.desc}
                </p>

                <p className="mt-5 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
                  {ideasLabel}
                </p>
                <ul className="mt-2.5 space-y-2">
                  {track.ideas.map((idea) => (
                    <li
                      key={idea}
                      className="flex gap-2.5 font-mono text-[12px] leading-relaxed text-[var(--text-dim)]"
                    >
                      <span className="text-[var(--bright)]">▸</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 border-t border-[var(--line)] pt-3.5 font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
                  <span className="text-[var(--bright)]">✦</span> {track.why}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] px-4 py-3.5">
                {/* El cupo se enseña aquí y no al confirmar: enterarte de que
                    el track está lleno después de elegirlo es el peor momento
                    posible, y el kickoff dura media hora. */}
                <span className="font-mono text-[11px] text-[var(--text-dim)]">
                  {track.capacity === null
                    ? t("tracks.teams", { count: track.teams })
                    : t("tracks.capacity", {
                        taken: track.teams,
                        capacity: track.capacity,
                      })}
                  {track.capacity !== null && (
                    <span
                      className={cn(
                        "ml-2",
                        track.teams >= track.capacity
                          ? "text-[var(--bright)]"
                          : undefined,
                      )}
                    >
                      ·{" "}
                      {track.teams >= track.capacity
                        ? t("tracks.capacityFull")
                        : t("tracks.capacityLeft", {
                            count: track.capacity - track.teams,
                          })}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  className={isSelected ? keyClass : keyGhostClass}
                  // Un track lleno se sigue viendo, pero no se puede elegir:
                  // deshabilitarlo dice más que dejar que falle al confirmar.
                  disabled={
                    pending ||
                    confirmed ||
                    (!isSelected &&
                      track.capacity !== null &&
                      track.teams >= track.capacity)
                  }
                  onClick={() => run(() => selectTrack(track.key))}
                >
                  {isSelected ? t("tracks.chosen") : t("tracks.choose")}
                </button>
              </div>
            </Panel>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 font-mono text-[12px] text-[var(--bright)]">
          {error}
        </p>
      )}

      {current && (
        <div className="sticky bottom-4 z-30 mt-5">
          <div className="flex flex-col gap-3 border border-[var(--line)] bg-[var(--screen-dim)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Basic n={39}>
                {confirmed ? t("tracks.barConfirmed") : t("tracks.barDraft")}
              </Basic>
              <p className="mt-1.5 truncate font-mono text-[13px] text-[var(--text)]">
                TRACK {current.id} · {current.name}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[var(--text-dim)]">
                {confirmed
                  ? t("tracks.barConfirmedHint")
                  : t("tracks.barDraftHint")}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {confirmed ? (
                <button
                  type="button"
                  className={keyGhostClass}
                  disabled={pending}
                  onClick={() => run(() => releaseTrack())}
                >
                  {t("tracks.release")}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={keyGhostClass}
                    disabled={pending}
                    onClick={() => run(() => releaseTrack())}
                  >
                    {t("tracks.clear")}
                  </button>
                  <button
                    type="button"
                    className={keyClass}
                    disabled={pending}
                    onClick={() => run(() => confirmTrack())}
                  >
                    {t("tracks.confirm")} →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { TRACKS };
