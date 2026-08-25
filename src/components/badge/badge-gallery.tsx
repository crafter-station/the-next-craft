"use client";

import { useMemo, useState } from "react";

import {
  formatParticipantNumber,
  type PublishedParticipantCard,
  participantBadgeImagePath,
} from "@/lib/badge/profile";

import { Link } from "@/i18n/navigation";

type BadgeGalleryProps = {
  participants: PublishedParticipantCard[];
  labels: {
    search: string;
    searchPlaceholder: string;
    emptySearch: string;
    count: string;
    badgeAlt: string;
  };
};

export function BadgeGallery({ participants, labels }: BadgeGalleryProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return participants;
    return participants.filter((participant) => {
      const number = formatParticipantNumber(participant.participantNumber);
      return (
        participant.displayName.toLowerCase().includes(needle) ||
        number.includes(needle) ||
        `#${number}`.includes(needle)
      );
    });
  }, [participants, query]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--text-dim)]">
          {labels.count.replace("{count}", String(filtered.length))}
        </p>
        <label className="flex min-w-0 flex-1 flex-col gap-2 md:max-w-md">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bright)]">
            {labels.search}
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="min-h-12 border border-[var(--line)] bg-[var(--screen-dim)] px-4 font-mono text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-dim)] focus:border-[var(--bright)]"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="border border-[var(--line)] bg-[var(--screen-dim)] px-5 py-8 font-mono text-sm text-[var(--text-dim)]">
          {labels.emptySearch}
        </p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-2 border-t border-l border-[var(--line)] bg-[var(--screen-dim)] p-0 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((participant) => {
            const formattedNumber = formatParticipantNumber(
              participant.participantNumber,
            );
            return (
              <li key={participant.participantNumber} className="min-w-0">
                <Link
                  href={`/participant/${formattedNumber}`}
                  className="group flex h-full min-w-0 flex-col border-r border-b border-[var(--line)] no-underline transition-colors duration-150 hover:bg-[var(--void)]"
                >
                  {/* biome-ignore lint/performance/noImgElement: dynamic generated badge image. */}
                  <img
                    src={participantBadgeImagePath(
                      participant.participantNumber,
                      participant.updatedAt,
                      540,
                    )}
                    width={540}
                    height={675}
                    alt={labels.badgeAlt.replace(
                      "{name}",
                      participant.displayName,
                    )}
                    loading="lazy"
                    className="aspect-[4/5] w-full bg-[var(--void)] object-cover"
                  />
                  <div className="flex min-w-0 flex-col gap-1 px-3 py-3 md:px-4 md:py-4">
                    <p className="font-pixel text-xs text-[var(--bright)] md:text-sm">
                      #{formattedNumber}
                    </p>
                    <p className="break-words font-mono text-sm leading-snug text-[var(--text)] group-hover:text-[var(--bright)]">
                      {participant.displayName}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
