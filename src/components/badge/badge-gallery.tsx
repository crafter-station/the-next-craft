"use client";

import { useMemo, useState } from "react";

import {
  formatParticipantNumber,
  type PublishedParticipantCard,
  participantBadgeImagePath,
} from "@/lib/badge/profile";
import type { CityKey } from "@/lib/cities";

import { Link } from "@/i18n/navigation";

type BadgeGalleryProps = {
  participants: PublishedParticipantCard[];
  labels: {
    search: string;
    searchPlaceholder: string;
    emptySearch: string;
    count: string;
    badgeAlt: string;
    cityFilter: string;
    allCities: string;
  };
  cities: { key: CityKey; label: string }[];
};

export function BadgeGallery({
  participants,
  labels,
  cities,
}: BadgeGalleryProps) {
  const [query, setQuery] = useState("");
  const [activeCity, setActiveCity] = useState<CityKey | "all">("all");

  const cityCounts = useMemo(() => {
    const counts = new Map<CityKey, number>();
    for (const participant of participants) {
      if (participant.city) {
        counts.set(participant.city, (counts.get(participant.city) ?? 0) + 1);
      }
    }
    return counts;
  }, [participants]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return participants.filter((participant) => {
      if (activeCity !== "all" && participant.city !== activeCity) return false;
      if (!needle) return true;
      const number = formatParticipantNumber(participant.participantNumber);
      return (
        participant.displayName.toLowerCase().includes(needle) ||
        number.includes(needle) ||
        `#${number}`.includes(needle)
      );
    });
  }, [activeCity, participants, query]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:items-end">
        <fieldset className="min-w-0">
          <legend className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bright)]">
            {labels.cityFilter}
          </legend>
          <div className="flex w-fit max-w-full flex-wrap border-t border-l border-[var(--line)]">
            <button
              type="button"
              aria-pressed={activeCity === "all"}
              onClick={() => setActiveCity("all")}
              className="flex h-12 items-center gap-3 border-r border-b border-[var(--line)] px-4 font-mono text-xs uppercase tracking-[0.12em] transition-colors hover:bg-[var(--screen-dim)] aria-pressed:bg-[var(--bright)] aria-pressed:text-[var(--void)]"
            >
              <span>{labels.allCities}</span>
              <span className="font-semibold tabular-nums">
                {participants.length}
              </span>
            </button>
            {cities.map((city) => (
              <button
                key={city.key}
                type="button"
                aria-pressed={activeCity === city.key}
                onClick={() => setActiveCity(city.key)}
                className="flex h-12 items-center gap-3 border-r border-b border-[var(--line)] px-4 font-mono text-xs uppercase tracking-[0.12em] transition-colors hover:bg-[var(--screen-dim)] aria-pressed:bg-[var(--bright)] aria-pressed:text-[var(--void)]"
              >
                <span>{city.label}</span>
                <span className="font-semibold tabular-nums">
                  {cityCounts.get(city.key) ?? 0}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
        <label className="flex min-w-0 flex-col gap-2">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bright)]">
            {labels.search}
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="h-12 border border-[var(--line)] bg-[var(--screen-dim)] px-4 font-mono text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-dim)] focus:border-[var(--bright)]"
          />
        </label>
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--text-dim)]">
        {labels.count.replace("{count}", String(filtered.length))}
      </p>

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
              <li key={participant.participantNumber}>
                <Link
                  href={`/participant/${formattedNumber}`}
                  className="group flex h-full flex-col border-r border-b border-[var(--line)] no-underline transition-colors duration-150 hover:bg-[var(--void)]"
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
                  <div className="flex flex-col gap-1 px-3 py-3 md:px-4 md:py-4">
                    <p className="font-pixel text-xs text-[var(--bright)] md:text-sm">
                      #{formattedNumber}
                    </p>
                    <p className="font-mono text-sm leading-snug text-[var(--text)] group-hover:text-[var(--bright)]">
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
