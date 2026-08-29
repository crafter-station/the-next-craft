import {
  type CityKey,
  cityClockLabel,
  cityTimeZone,
  cityUtcOffset,
} from "@/lib/cities";

import {
  EVENT_CLOSES,
  EVENT_DAY,
  EVENT_OPENS,
  SUBMISSION_TIME,
} from "./content";

/**
 * Un instante a partir de una hora local de sede.
 *
 * `hhmm` es hora de pared —lo que dice el cartel de la pared en esa sede— y el
 * offset la ancla al momento real. Sin la sede esto no se puede resolver: las
 * 09:00 son un instante distinto en Lima que en Guatemala.
 */
export function atEventTime(hhmm: string, city: CityKey | null) {
  return new Date(`${EVENT_DAY}T${hhmm}:00${cityUtcOffset(city)}`);
}

export function eventOpensAt(city: CityKey | null) {
  return atEventTime(EVENT_OPENS, city);
}

export function eventClosesAt(city: CityKey | null) {
  return atEventTime(EVENT_CLOSES, city);
}

/** Code freeze de la sede: las 20:00 de su propio reloj. */
export function submissionDeadline(city: CityKey | null) {
  return atEventTime(SUBMISSION_TIME, city);
}

export function minutesOf(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export type EventPhase = "before" | "during" | "after";

/**
 * «Ahora», siempre real.
 *
 * Antes esto anclaba a las 16:20 del día del evento en cuanto el reloj caía
 * fuera de la ventana, y eso significa que el día ANTES el dashboard enseñaba
 * el evento medio consumido a gente que solo venía a hacerse el badge. El ancla
 * sigue disponible para demos, pero hay que pedirla: `DASHBOARD_CLOCK_ANCHOR`
 * con una hora local («16:20»). Sin esa variable manda el reloj de verdad.
 *
 * `phase` es lo que sustituye al ancla: fuera de la ventana no inventamos una
 * hora, decimos en qué lado estamos y cada página decide qué enseñar.
 */
export function resolveNow(city: CityKey | null) {
  const anchor = process.env.DASHBOARD_CLOCK_ANCHOR;
  const opens = eventOpensAt(city);
  const closes = eventClosesAt(city);

  if (anchor && /^\d{2}:\d{2}$/.test(anchor)) {
    return {
      now: atEventTime(anchor, city),
      anchored: true as const,
      phase: "during" as EventPhase,
    };
  }

  const now = new Date();
  const phase: EventPhase =
    now < opens ? "before" : now > closes ? "after" : "during";
  return { now, anchored: false as const, phase };
}

export type BlockStatus = "past" | "now" | "next";

export function statusOf(
  start: string,
  end: string,
  now: Date,
  city: CityKey | null,
): BlockStatus {
  const s = atEventTime(start, city);
  const e = atEventTime(end, city);
  if (now >= s && now < e) return "now";
  return now >= e ? "past" : "next";
}

export function formatClock(date: Date, locale: string, city: CityKey | null) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: cityTimeZone(city),
  }).format(date);
}

export function formatDateTime(
  date: Date,
  locale: string,
  city: CityKey | null,
) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: cityTimeZone(city),
  }).format(date);
}

export { cityClockLabel, cityTimeZone };

/** Piezas del countdown, para pintarlo como el de la landing. */
export function countdown(target: Date, now: Date) {
  const ms = target.getTime() - now.getTime();
  const abs = Math.abs(ms);
  return {
    past: ms < 0,
    hrs: Math.floor(abs / 3_600_000),
    min: Math.floor((abs % 3_600_000) / 60_000),
    sec: Math.floor((abs % 60_000) / 1000),
  };
}

/** Porcentaje transcurrido de las 12 horas de la sede. */
export function eventProgress(now: Date, city: CityKey | null) {
  const opens = eventOpensAt(city).getTime();
  const closes = eventClosesAt(city).getTime();
  const pct = ((now.getTime() - opens) / (closes - opens)) * 100;
  return Math.min(100, Math.max(0, pct));
}
