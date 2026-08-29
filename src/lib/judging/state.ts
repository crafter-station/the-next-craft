import { cookies } from "next/headers";

import { and, asc, eq, isNotNull, sql } from "drizzle-orm";

import type { CityKey } from "@/lib/cities";
import { db } from "@/lib/db";
import {
  dashboardPanelists,
  dashboardScores,
  dashboardSettings,
  dashboardTeams,
} from "@/lib/db/schema";
import type { TrackKey } from "@/lib/db/schema-types";

import {
  ACCESS_CODE_KEY,
  GATE_COOKIE,
  GATE_SUBJECT,
  newAccessCode,
  PANELIST_COOKIE,
  readSession,
} from "./access";
import { normalizePanel, type PanelResult, type ScoreEntry } from "./normalize";
import { CRITERION_KEYS, type CriterionKey, isValidScore } from "./rubric";

export type PanelRole = "mentor" | "judge";
export type Phase = "sede" | "final";

export type Panelist = {
  id: string;
  email: string;
  fullName: string;
  role: PanelRole;
  city: CityKey | null;
};

/** A cada rol le toca su fase. No hay panelista que califique en las dos. */
export function phaseOf(role: PanelRole): Phase {
  return role === "mentor" ? "sede" : "final";
}

export type ScoreDraft = {
  scores: Partial<Record<CriterionKey, number>>;
  evidence: Record<string, string>;
  submittedAt: Date | null;
};

export type JudgeableTeam = {
  id: string;
  slug: string;
  name: string;
  city: CityKey | null;
  track: TrackKey | null;
  tableNumber: string | null;
  pitch: string | null;
  demoUrl: string | null;
  repoUrl: string | null;
  /** Lo que este panelista lleva puesto sobre este equipo. */
  own: ScoreDraft | null;
};

/**
 * El código con el que entra todo el panel.
 *
 * Se crea solo la primera vez que alguien lo pide, para que el tablero nunca
 * aparezca sin código que dictar. `onConflictDoNothing` es el candado: dos
 * peticiones simultáneas en el arranque no pueden dejar dos códigos distintos.
 */
export async function sharedAccessCode(): Promise<string> {
  const [existing] = await db
    .select({ value: dashboardSettings.value })
    .from(dashboardSettings)
    .where(eq(dashboardSettings.key, ACCESS_CODE_KEY))
    .limit(1);
  if (existing) return existing.value;

  await db
    .insert(dashboardSettings)
    .values({ key: ACCESS_CODE_KEY, value: newAccessCode() })
    .onConflictDoNothing();

  const [created] = await db
    .select({ value: dashboardSettings.value })
    .from(dashboardSettings)
    .where(eq(dashboardSettings.key, ACCESS_CODE_KEY))
    .limit(1);
  return created.value;
}

/** ¿Acertó el código, aunque todavía no haya dicho quién es? */
export async function passedGate(): Promise<boolean> {
  const store = await cookies();
  return readSession(store.get(GATE_COOKIE)?.value) === GATE_SUBJECT;
}

/**
 * Quién puede elegirse en la pantalla de «¿quién eres?».
 *
 * Se enseña el panel entero y no solo una sede: con un código común no hay
 * forma de saber desde qué sede entra alguien hasta que lo dice él.
 */
export async function rosterForPicker(): Promise<
  { id: string; fullName: string; role: PanelRole; city: CityKey | null }[]
> {
  return db
    .select({
      id: dashboardPanelists.id,
      fullName: dashboardPanelists.fullName,
      role: dashboardPanelists.role,
      city: dashboardPanelists.city,
    })
    .from(dashboardPanelists)
    .where(sql`${dashboardPanelists.revokedAt} is null`)
    .orderBy(asc(dashboardPanelists.role), asc(dashboardPanelists.fullName));
}

/**
 * El panelista en sesión, o null.
 *
 * Sale de la cookie firmada, no de Better Auth: el panel entra por código y no
 * por correo (ver `access.ts`). Se vuelve a leer la fila en cada petición en
 * vez de confiar en lo que diga el token, porque una baja tiene que surtir
 * efecto en el momento y no cuando caduque la cookie una semana después.
 */
export async function currentPanelist(): Promise<Panelist | null> {
  const store = await cookies();
  const panelistId = readSession(store.get(PANELIST_COOKIE)?.value);
  if (!panelistId) return null;

  const [row] = await db
    .select({
      id: dashboardPanelists.id,
      email: dashboardPanelists.email,
      fullName: dashboardPanelists.fullName,
      role: dashboardPanelists.role,
      city: dashboardPanelists.city,
      revokedAt: dashboardPanelists.revokedAt,
    })
    .from(dashboardPanelists)
    .where(eq(dashboardPanelists.id, panelistId))
    .limit(1);

  if (!row || row.revokedAt) return null;

  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    role: row.role,
    city: row.city,
  };
}

function toDraft(row: {
  demo: number | null;
  usage: number | null;
  craft: number | null;
  ambition: number | null;
  pitch: number | null;
  evidence: Record<string, string> | null;
  submittedAt: Date | null;
}): ScoreDraft {
  const scores: Partial<Record<CriterionKey, number>> = {};
  for (const criterion of CRITERION_KEYS) {
    const value = row[criterion];
    if (isValidScore(value)) scores[criterion] = value;
  }
  return {
    scores,
    evidence: row.evidence ?? {},
    submittedAt: row.submittedAt,
  };
}

/**
 * Los equipos que le tocan a un panelista.
 *
 * El alcance sale del rol, no de un parámetro: un mentor ve los equipos de SU
 * sede, un jurado ve los finalistas de las cinco. Que el alcance no sea
 * pasable evita el fallo aburrido de que una vista pida la lista equivocada.
 */
export async function teamsForPanelist(
  panelist: Panelist,
): Promise<JudgeableTeam[]> {
  const scope =
    panelist.role === "mentor"
      ? panelist.city
        ? eq(dashboardTeams.city, panelist.city)
        : sql`false`
      : isNotNull(dashboardTeams.finalistAt);

  const rows = await db
    .select({
      id: dashboardTeams.id,
      slug: dashboardTeams.slug,
      name: dashboardTeams.name,
      city: dashboardTeams.city,
      track: dashboardTeams.track,
      tableNumber: dashboardTeams.tableNumber,
      pitch: dashboardTeams.pitch,
      demoUrl: dashboardTeams.demoUrl,
      repoUrl: dashboardTeams.repoUrl,
      demo: dashboardScores.demo,
      usage: dashboardScores.usage,
      craft: dashboardScores.craft,
      ambition: dashboardScores.ambition,
      pitchScore: dashboardScores.pitch,
      evidence: dashboardScores.evidence,
      submittedAt: dashboardScores.submittedAt,
      scoreId: dashboardScores.id,
    })
    .from(dashboardTeams)
    .leftJoin(
      dashboardScores,
      and(
        eq(dashboardScores.teamId, dashboardTeams.id),
        eq(dashboardScores.panelistId, panelist.id),
        eq(dashboardScores.phase, phaseOf(panelist.role)),
      ),
    )
    // Un equipo sin track confirmado no llegó a competir.
    .where(and(scope, isNotNull(dashboardTeams.track)))
    .orderBy(asc(dashboardTeams.name));

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    track: row.track,
    tableNumber: row.tableNumber,
    pitch: row.pitch,
    demoUrl: row.demoUrl,
    repoUrl: row.repoUrl,
    own: row.scoreId
      ? toDraft({
          demo: row.demo,
          usage: row.usage,
          craft: row.craft,
          ambition: row.ambition,
          pitch: row.pitchScore,
          evidence: row.evidence,
          submittedAt: row.submittedAt,
        })
      : null,
  }));
}

export type PanelSummary = {
  /** `null` en la final: no es de ninguna sede, son todas. */
  city: CityKey | null;
  phase: Phase;
  result: PanelResult;
  teams: Map<
    string,
    {
      name: string;
      slug: string;
      track: TrackKey | null;
      finalist: boolean;
    }
  >;
  panelistNames: Map<string, string>;
};

/**
 * El resultado normalizado de un panel.
 *
 * Un panel es lo que SÍ se puede comparar entre sí: los mentores de una sede
 * sobre los equipos de esa sede, o los jurados de la final sobre todos los
 * finalistas. Nunca las cinco sedes juntas —no comparten mentores ni equipos,
 * así que no hay nada que ponga sus notas en la misma escala—. Por eso la sede
 * es obligatoria en la fase 1 y no existe en la fase 2.
 *
 * Solo entran calificaciones enviadas y con los cinco criterios puestos: una
 * fila a medias sesga la media del panelista y con ella los z de todos los
 * equipos que vio.
 */
export async function panelResults(
  phase: Phase,
  city: CityKey | null,
): Promise<PanelSummary> {
  const scope =
    phase === "sede"
      ? city
        ? eq(dashboardTeams.city, city)
        : sql`false`
      : isNotNull(dashboardTeams.finalistAt);

  const rows = await db
    .select({
      panelistId: dashboardScores.panelistId,
      panelistName: dashboardPanelists.fullName,
      teamId: dashboardTeams.id,
      teamName: dashboardTeams.name,
      teamSlug: dashboardTeams.slug,
      track: dashboardTeams.track,
      finalistAt: dashboardTeams.finalistAt,
      demo: dashboardScores.demo,
      usage: dashboardScores.usage,
      craft: dashboardScores.craft,
      ambition: dashboardScores.ambition,
      pitch: dashboardScores.pitch,
    })
    .from(dashboardScores)
    .innerJoin(dashboardTeams, eq(dashboardTeams.id, dashboardScores.teamId))
    .innerJoin(
      dashboardPanelists,
      eq(dashboardPanelists.id, dashboardScores.panelistId),
    )
    .where(
      and(
        eq(dashboardScores.phase, phase),
        isNotNull(dashboardScores.submittedAt),
        scope,
      ),
    );

  const entries: ScoreEntry[] = [];
  const teams = new Map<
    string,
    { name: string; slug: string; track: TrackKey | null; finalist: boolean }
  >();
  const panelistNames = new Map<string, string>();

  for (const row of rows) {
    const scores: Partial<Record<CriterionKey, number>> = {};
    let complete = true;
    for (const criterion of CRITERION_KEYS) {
      const value = row[criterion];
      if (!isValidScore(value)) {
        complete = false;
        break;
      }
      scores[criterion] = value;
    }
    if (!complete) continue;

    entries.push({
      panelistId: row.panelistId,
      teamId: row.teamId,
      scores: scores as Record<CriterionKey, number>,
    });
    teams.set(row.teamId, {
      name: row.teamName,
      slug: row.teamSlug,
      track: row.track,
      finalist: Boolean(row.finalistAt),
    });
    panelistNames.set(row.panelistId, row.panelistName);
  }

  return {
    city,
    phase,
    result: normalizePanel(entries),
    teams,
    panelistNames,
  };
}

/** La lista blanca completa, para el tablero del staff. */
export async function listPanelists() {
  return db
    .select({
      id: dashboardPanelists.id,
      email: dashboardPanelists.email,
      fullName: dashboardPanelists.fullName,
      role: dashboardPanelists.role,
      city: dashboardPanelists.city,
      revokedAt: dashboardPanelists.revokedAt,
      scored: sql<number>`(
        select count(*) from dashboard_scores s
        where s.panelist_id = ${dashboardPanelists.id}
          and s.submitted_at is not null
      )`,
    })
    .from(dashboardPanelists)
    .orderBy(asc(dashboardPanelists.role), asc(dashboardPanelists.fullName));
}
