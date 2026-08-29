"use server";

import { revalidatePath } from "next/cache";

import { and, eq, isNotNull, sql } from "drizzle-orm";

import type { CityKey } from "@/lib/cities";
import { currentStaffEmail } from "@/lib/dashboard/staff";
import { db } from "@/lib/db";
import {
  dashboardPanelists,
  dashboardScores,
  dashboardTeams,
} from "@/lib/db/schema";
import type { TrackKey } from "@/lib/db/schema-types";

import { createProject, updateProject } from "./projects";
import { CRITERIA, type CriterionKey, isValidScore } from "./rubric";
import { currentPanelist, phaseOf } from "./state";

export type JudgingError =
  | "not-a-panelist"
  | "team-out-of-scope"
  | "invalid-score"
  | "missing-scores"
  | "missing-evidence"
  | "already-submitted"
  | "not-staff"
  | "invalid-email"
  | "mentor-needs-city"
  | "name-too-short"
  | "project-needs-city-and-track";

type Result = { ok: true } | { ok: false; error: JudgingError };

export type ScorePayload = {
  teamId: string;
  scores: Partial<Record<CriterionKey, number>>;
  evidence: Record<string, string>;
  /** `false` guarda borrador; `true` lo cierra y lo mete al cálculo. */
  submit: boolean;
};

/**
 * Las dos superficies que enseñan esto: la cola del panelista y el tablero del
 * comité. Revalidar solo una dejaría al staff mirando un ranking viejo justo
 * cuando entran las últimas notas.
 */
function refresh() {
  revalidatePath("/[locale]/judge", "layout");
  revalidatePath("/[locale]/admin/judging", "page");
}

/**
 * ¿Este equipo le toca a este panelista?
 *
 * Se comprueba contra la base y no contra lo que mandó el formulario: el
 * alcance de un mentor es su sede y el de un jurado son los finalistas, y ese
 * es justo el borde que hay que defender del `teamId` que llega por la red.
 */
async function teamInScope(
  teamId: string,
  role: "mentor" | "judge",
  city: CityKey | null,
): Promise<boolean> {
  const scope =
    role === "mentor"
      ? city
        ? eq(dashboardTeams.city, city)
        : sql`false`
      : isNotNull(dashboardTeams.finalistAt);

  const [row] = await db
    .select({ id: dashboardTeams.id })
    .from(dashboardTeams)
    .where(and(eq(dashboardTeams.id, teamId), scope))
    .limit(1);
  return Boolean(row);
}

/**
 * Guardar o enviar una calificación.
 *
 * Un borrador acepta huecos; un envío no. La diferencia no es cosmética: una
 * fila a medias que entrara al cálculo movería la media del panelista y con
 * ella los z de todos los equipos que vio, así que solo cuentan las enviadas y
 * completas.
 *
 * Una vez enviada no se reabre. El panelista califica lo que acaba de ver, y
 * poder volver atrás al final de la tarde es exactamente cómo se cuela el
 * ajuste hacia el resultado que uno quería.
 */
export async function saveScore(payload: ScorePayload): Promise<Result> {
  const panelist = await currentPanelist();
  if (!panelist) return { ok: false, error: "not-a-panelist" };

  const inScope = await teamInScope(
    payload.teamId,
    panelist.role,
    panelist.city,
  );
  if (!inScope) return { ok: false, error: "team-out-of-scope" };

  const phase = phaseOf(panelist.role);

  const [existing] = await db
    .select({
      id: dashboardScores.id,
      submittedAt: dashboardScores.submittedAt,
    })
    .from(dashboardScores)
    .where(
      and(
        eq(dashboardScores.panelistId, panelist.id),
        eq(dashboardScores.teamId, payload.teamId),
        eq(dashboardScores.phase, phase),
      ),
    )
    .limit(1);

  if (existing?.submittedAt) return { ok: false, error: "already-submitted" };

  const values: Partial<Record<CriterionKey, number | null>> = {};
  for (const criterion of CRITERIA) {
    const value = payload.scores[criterion.key];
    if (value === undefined || value === null) {
      values[criterion.key] = null;
      continue;
    }
    if (!isValidScore(value)) return { ok: false, error: "invalid-score" };
    values[criterion.key] = value;
  }

  const evidence: Record<string, string> = {};
  for (const criterion of CRITERIA) {
    const text = payload.evidence[criterion.key]?.trim();
    if (text) evidence[criterion.key] = text.slice(0, 600);
  }

  if (payload.submit) {
    for (const criterion of CRITERIA) {
      if (values[criterion.key] === null) {
        return { ok: false, error: "missing-scores" };
      }
      // La evidencia se pide donde más pesa (demo y uso, 55% entre las dos):
      // obligarla en los cinco alarga tanto el formulario que la gente deja de
      // escribir nada útil en ninguno.
      if (criterion.evidenceRequired && !evidence[criterion.key]) {
        return { ok: false, error: "missing-evidence" };
      }
    }
  }

  const row = {
    panelistId: panelist.id,
    teamId: payload.teamId,
    phase,
    demo: values.demo ?? null,
    usage: values.usage ?? null,
    craft: values.craft ?? null,
    ambition: values.ambition ?? null,
    pitch: values.pitch ?? null,
    evidence,
    submittedAt: payload.submit ? new Date() : null,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(dashboardScores)
      .set(row)
      .where(eq(dashboardScores.id, existing.id));
  } else {
    await db.insert(dashboardScores).values(row);
  }

  refresh();
  return { ok: true };
}

/**
 * Marcar (o desmarcar) finalistas. Solo staff.
 *
 * El corte lo decide el comité mirando el ranking normalizado, no un umbral
 * automático: cuántos finalistas salen de una sede depende de cuántos equipos
 * hubo allí, y eso cambia entre las cinco.
 */
export async function setFinalist(
  teamId: string,
  finalist: boolean,
): Promise<Result> {
  const staff = await currentStaffEmail();
  if (!staff) return { ok: false, error: "not-staff" };

  await db
    .update(dashboardTeams)
    .set({ finalistAt: finalist ? new Date() : null, updatedAt: new Date() })
    .where(eq(dashboardTeams.id, teamId));

  refresh();
  return { ok: true };
}

/**
 * Dar de alta a un mentor o a un jurado. Solo staff.
 *
 * Alta = poder recibir el OTP. Mentores y jurados no están en Luma ni llevan
 * correo de la organización, así que sin esta lista no tienen forma de entrar.
 * Un mentor sin sede no vería ningún equipo, y eso se siente como un fallo de
 * la app en vez de como un dato que falta: se rechaza aquí.
 */
export async function addPanelist(input: {
  email: string;
  fullName: string;
  role: "mentor" | "judge";
  city: CityKey | null;
}): Promise<Result> {
  const staff = await currentStaffEmail();
  if (!staff) return { ok: false, error: "not-staff" };

  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "invalid-email" };
  }
  if (input.role === "mentor" && !input.city) {
    return { ok: false, error: "mentor-needs-city" };
  }

  const fullName = input.fullName.trim().replace(/\s+/g, " ") || email;

  await db
    .insert(dashboardPanelists)
    .values({
      email,
      fullName,
      role: input.role,
      city: input.role === "mentor" ? input.city : null,
      invitedByEmail: staff,
    })
    // Reinvitar a alguien que ya estaba lo reactiva en vez de fallar: en la
    // puerta de una sede eso es lo que la persona quiere decir.
    .onConflictDoUpdate({
      target: dashboardPanelists.email,
      set: {
        fullName,
        role: input.role,
        city: input.role === "mentor" ? input.city : null,
        revokedAt: null,
      },
    });

  refresh();
  return { ok: true };
}

/**
 * Dar de baja. No borra: los puntajes que ya emitió siguen contando, porque
 * calificó lo que vio y quitarlos cambiaría el resultado de sus equipos.
 */
export async function revokePanelist(panelistId: string): Promise<Result> {
  const staff = await currentStaffEmail();
  if (!staff) return { ok: false, error: "not-staff" };

  await db
    .update(dashboardPanelists)
    .set({ revokedAt: new Date() })
    .where(eq(dashboardPanelists.id, panelistId));

  refresh();
  return { ok: true };
}

/**
 * Crear un proyecto a mano. Solo staff.
 *
 * La vía normal es que el equipo se forme en `/dashboard/team`, pero el sistema
 * se usa para consignar y no siempre hay un equipo del dashboard detrás: hay
 * quien se formó en la sala y nunca abrió la app. Sede y track son obligatorios
 * porque sin ellos el proyecto no lo ve ningún mentor.
 */
export async function createProjectAction(input: {
  name: string;
  city: CityKey | null;
  track: TrackKey | null;
  tableNumber: string | null;
  demoUrl: string | null;
}): Promise<Result> {
  const staff = await currentStaffEmail();
  if (!staff) return { ok: false, error: "not-staff" };

  const name = input.name.trim().replace(/\s+/g, " ");
  if (name.length < 2) return { ok: false, error: "name-too-short" };
  if (!input.city || !input.track) {
    return { ok: false, error: "project-needs-city-and-track" };
  }

  await createProject({
    name,
    city: input.city,
    track: input.track,
    tableNumber: input.tableNumber?.trim() || null,
    demoUrl: input.demoUrl?.trim() || null,
  });

  refresh();
  return { ok: true };
}

/** Completar o corregir un proyecto que ya existe. Solo staff. */
export async function updateProjectAction(
  teamId: string,
  input: {
    city?: CityKey | null;
    track?: TrackKey | null;
    tableNumber?: string | null;
    demoUrl?: string | null;
  },
): Promise<Result> {
  const staff = await currentStaffEmail();
  if (!staff) return { ok: false, error: "not-staff" };

  await updateProject(teamId, input);
  refresh();
  return { ok: true };
}
