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

/* ── Mentorías ─────────────────────────────────────────────── */

/**
 * Las mentorías no se reservan: durante el bloque de 11:00 a 13:00 los mentores
 * están en la sala y el equipo se les acerca. Esta lista existe solo para que
 * cada hacker sepa a quién tiene en **su** sede antes de levantarse de la mesa.
 *
 * Por eso es contenido estático y no una tabla: no hay nada que reservar, ni
 * cupo, ni estado que guardar.
 *
 * Los nombres salen de `public/brand-assets/social/roles/mentors/`, que es la
 * misma fuente que usa la galería pública de /mentors-and-judges. Van sin
 * tildes porque así están ahí y así se publican; no los "corrijo" desde aquí.
 */
export type Mentor = {
  /** Coincide con el nombre del asset, para poder enlazar su tarjeta. */
  slug: string;
  name: string;
  /**
   * Sedes donde estará. Vacío = todavía sin confirmar, y la interfaz lo dice
   * en vez de esconderlo o de fingir que está en todas.
   */
  cities: CityKey[];
};

/**
 * ⚠️ FALTA EL REPARTO POR SEDE. Los trece nombres son los reales, pero ni la
 * galería pública ni el repo dicen quién va a qué sede, así que `cities` está
 * vacío en todos. Rellenar aquí es lo único que hace falta: la página ya los
 * agrupa por sede sola.
 */
export const MENTORS: Mentor[] = [
  { slug: "arturo-barrantes", name: "Arturo Barrantes", cities: [] },
  { slug: "cesar-duenas", name: "Cesar Duenas", cities: [] },
  { slug: "danitza-rosas", name: "Danitza Rosas", cities: [] },
  { slug: "ellin-orjuela", name: "Ellin Orjuela", cities: [] },
  { slug: "emmy-pardo", name: "Emmy Pardo", cities: [] },
  { slug: "fiorella-cisneros", name: "Fiorella Cisneros", cities: [] },
  { slug: "ignacio-velasquez", name: "Ignacio Velasquez", cities: [] },
  { slug: "juan-ortega", name: "Juan Ortega", cities: [] },
  { slug: "maria-cristina-ruelas", name: "Maria Cristina Ruelas", cities: [] },
  { slug: "nicolas-vargas", name: "Nicolas Vargas", cities: [] },
  { slug: "sandra-carrillo", name: "Sandra Carrillo", cities: [] },
  { slug: "victor-galvez", name: "Victor Galvez", cities: [] },
  { slug: "yesica-qu", name: "Yesica Qu", cities: [] },
];

/**
 * Los mentores de una sede, y aparte los que aún no tienen sede.
 *
 * Se devuelven los dos grupos porque callarse los segundos sería enseñar una
 * lista corta como si estuviera completa, justo el día que el hacker decide si
 * levantarse de la silla a buscar a alguien.
 */
export function mentorsByHub(city: CityKey | null) {
  const assigned = MENTORS.filter((m) => m.cities.length > 0);
  return {
    hub: city ? assigned.filter((m) => m.cities.includes(city)) : assigned,
    unassigned: MENTORS.filter((m) => m.cities.length === 0),
  };
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
    url: "https://tavily.com",
    valueUsd: 8,
    perParticipant: false,
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
    url: "https://apify.com",
    valueUsd: 50,
    perParticipant: true,
    steps: 3,
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

/**
 * Código de canje para un participante. En producción lo emite la API del
 * partner; hasta entonces es determinista y por persona, para que el mismo
 * hacker vea siempre el mismo código.
 */
export function partnerRedemptionCode(
  partnerKey: string,
  participantId: string,
) {
  const short = participantId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `TNC26-${partnerKey.toUpperCase()}-${short}`;
}
