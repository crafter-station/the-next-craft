import {
  EVENT_CLOSES_AT,
  EVENT_DAY,
  EVENT_OPENS_AT,
  EVENT_TZ_OFFSET,
} from "./content";

export const EVENT_TIME_ZONE = "America/Bogota";

export function atEventTime(hhmm: string) {
  return new Date(`${EVENT_DAY}T${hhmm}:00${EVENT_TZ_OFFSET}`);
}

export function minutesOf(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * El evento es un solo día de 12 horas. Cuando el reloj real cae fuera de esa
 * ventana anclamos «ahora» dentro del evento para que el dashboard se pueda
 * revisar y probar — y la interfaz lo declara en vez de fingirlo.
 */
export function resolveNow() {
  const real = new Date();
  const opens = new Date(EVENT_OPENS_AT);
  const closes = new Date(EVENT_CLOSES_AT);
  if (real >= opens && real <= closes) {
    return { now: real, anchored: false as const };
  }
  return { now: atEventTime("16:20"), anchored: true as const };
}

export type BlockStatus = "past" | "now" | "next";

export function statusOf(start: string, end: string, now: Date): BlockStatus {
  const s = atEventTime(start);
  const e = atEventTime(end);
  if (now >= s && now < e) return "now";
  return now >= e ? "past" : "next";
}

export function formatClock(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: EVENT_TIME_ZONE,
  }).format(date);
}

export function formatDateTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: EVENT_TIME_ZONE,
  }).format(date);
}

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

/** Porcentaje transcurrido de las 12 horas. */
export function eventProgress(now: Date) {
  const opens = new Date(EVENT_OPENS_AT).getTime();
  const closes = new Date(EVENT_CLOSES_AT).getTime();
  const pct = ((now.getTime() - opens) / (closes - opens)) * 100;
  return Math.min(100, Math.max(0, pct));
}
