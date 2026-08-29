import type { CityKey } from "@/lib/cities";
import type { TrackKey } from "@/lib/db/schema-types";

/* ─────────────────────────────────────────────────────────────
   Contenido del dashboard que NO vive en la base de datos.

   La agenda, los tracks, los premios y los perks son contenido canónico y ya
   están traducidos en src/messages/{es,en}.json. Este módulo solo aporta los
   metadatos operativos que la landing no necesita —hora de fin, lugar, tipo de
   bloque, a quién aplica— y el catálogo de partners.

   Regla: nada de duplicar copy traducible aquí. Si es texto que el hacker lee,
   va a los mensajes.
   ───────────────────────────────────────────────────────────── */

export const EVENT_DAY = "2026-08-29";

/*
  Horas de pared, no instantes. Cada sede corre su propio día de 12 horas en su
  hora local: las 09:00 de Guatemala ocurren una hora después que las de Lima.
  Convertirlas a un momento concreto es trabajo de `time.ts`, que necesita saber
  la sede; fijar aquí un offset —como se hacía— daba por hecho que las cinco
  sedes están en UTC-5 y adelantaba una hora entera la agenda de Guatemala y
  El Salvador.
*/
export const EVENT_OPENS = "09:00";
export const EVENT_CLOSES = "21:00";
/** Code freeze: el repo y el formulario de entrega se cierran aquí. */
export const SUBMISSION_TIME = "20:00";

export type AgendaKind =
  | "ceremony"
  | "hacking"
  | "mentoring"
  | "meal"
  | "deadline"
  | "demo";

export type Audience = "hackers" | "mentors" | "sponsors" | "judges";

export type AgendaMeta = {
  /** Coincide con `schedule.events[].time` de los mensajes. */
  time: string;
  end: string;
  kind: AgendaKind;
  /** Clave de traducción del lugar, bajo `dashboard.places`. */
  place: string;
  mandatory?: boolean;
  audience: Audience[];
};

/**
 * Metadatos de los 9 bloques canónicos, indexados por hora de inicio.
 * El texto de cada bloque sale de `schedule.events` en los mensajes.
 */
export const AGENDA_META: AgendaMeta[] = [
  {
    time: "08:30",
    end: "09:00",
    kind: "ceremony",
    place: "entrance",
    mandatory: true,
    audience: ["hackers", "mentors", "sponsors"],
  },
  {
    time: "09:00",
    end: "09:30",
    kind: "ceremony",
    place: "stage",
    mandatory: true,
    audience: ["hackers", "mentors"],
  },
  {
    time: "09:30",
    end: "11:00",
    kind: "hacking",
    place: "table",
    audience: ["hackers"],
  },
  {
    time: "11:00",
    end: "13:00",
    kind: "mentoring",
    place: "mentoring",
    audience: ["hackers", "mentors"],
  },
  {
    time: "13:00",
    end: "14:00",
    kind: "meal",
    place: "food",
    audience: ["hackers", "mentors", "sponsors"],
  },
  {
    time: "16:00",
    end: "16:30",
    kind: "deadline",
    place: "table",
    mandatory: true,
    audience: ["hackers"],
  },
  {
    time: "18:30",
    end: "19:00",
    kind: "meal",
    place: "food",
    audience: ["hackers", "mentors"],
  },
  {
    time: "20:00",
    end: "20:15",
    kind: "deadline",
    place: "platform",
    mandatory: true,
    audience: ["hackers"],
  },
  {
    time: "20:15",
    end: "21:00",
    kind: "demo",
    place: "stage",
    mandatory: true,
    audience: ["hackers", "judges"],
  },
];

export const agendaMetaByTime = new Map(AGENDA_META.map((m) => [m.time, m]));

/** Los tres tracks, en el mismo orden que `tracks.items` de los mensajes. */
export const TRACKS: { key: TrackKey; id: string }[] = [
  { key: "content-machine", id: "01" },
  { key: "out-of-the-box", id: "02" },
  { key: "learning-by-shipping", id: "03" },
];

export function trackIndex(key: TrackKey) {
  return TRACKS.findIndex((t) => t.key === key);
}

/**
 * Créditos de partners para todos los que entran. El valor en dólares se usa
 * solo para el contador del dashboard; el texto del perk sale de
 * `prizes.perks` en los mensajes.
 */
export type Partner = {
  key: string;
  name: string;
  url: string;
  /** Valor aproximado en USD, para el contador. */
  valueUsd: number;
  /** El crédito es por persona, no por equipo. */
  perParticipant: boolean;
  /** Cuántos pasos de canje tiene: `dashboard.partners.<key>.steps.<n>`. */
  steps: number;
};

export const PARTNERS: Partner[] = [
  {
    key: "tavily",
    name: "Tavily",
    url: "https://app.tavily.com/billing",
    valueUsd: 8,
    perParticipant: true,
    steps: 3,
  },
  {
    key: "exa",
    name: "Exa",
    url: "https://exa.ai",
    valueUsd: 50,
    perParticipant: false,
    steps: 3,
  },
  {
    key: "vapi",
    name: "Vapi",
    url: "https://vapi.ai",
    valueUsd: 50,
    perParticipant: true,
    steps: 2,
  },
  {
    key: "apify",
    name: "Apify",
    url: "https://console.apify.com/billing",
    valueUsd: 50,
    perParticipant: true,
    steps: 4,
  },
  {
    key: "cursor",
    name: "Cursor",
    url: "https://cursor.com",
    valueUsd: 20,
    perParticipant: true,
    steps: 2,
  },
  {
    key: "elevenlabs",
    name: "ElevenLabs",
    url: "https://elevenlabs.io",
    valueUsd: 22,
    perParticipant: true,
    steps: 2,
  },
  {
    key: "n8n",
    name: "n8n",
    url: "https://n8n.io",
    valueUsd: 50,
    perParticipant: true,
    steps: 2,
  },
  {
    key: "replit",
    name: "Replit",
    url: "https://replit.com",
    valueUsd: 45,
    perParticipant: true,
    steps: 2,
  },
];

export const partnerByKey = new Map(PARTNERS.map((p) => [p.key, p]));

export const TOTAL_PARTNER_VALUE_USD = PARTNERS.reduce(
  (sum, p) => sum + p.valueUsd,
  0,
);
