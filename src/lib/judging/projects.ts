import "server-only";

import { asc, eq, isNotNull, sql } from "drizzle-orm";

import type { CityKey } from "@/lib/cities";
import { db } from "@/lib/db";
import { dashboardTeams } from "@/lib/db/schema";
import type { TrackKey } from "@/lib/db/schema-types";

/*
  Los proyectos que se califican.

  Normalmente los crean los propios hackers en `/dashboard/team` durante el
  kickoff. Pero el sistema se usa como herramienta de consignación, y eso
  significa que el staff tiene que poder escribir la lista él mismo: el equipo
  que se formó a mano en la sala, el que nunca abrió el dashboard, el que
  confirmó track tarde. Si la única vía fuera el flujo del hacker, un equipo que
  demostró de verdad quedaría fuera del cálculo por un trámite.

  Un proyecto sin sede o sin track NO es calificable, y eso no es un capricho:
  la sede decide qué mentores lo ven y el track decide en qué compite. Se
  enseñan igual, marcados, para que el staff los complete en vez de descubrir el
  hueco cuando el mentor no encuentra el equipo.
*/

export type Project = {
  id: string;
  name: string;
  slug: string;
  city: CityKey | null;
  track: TrackKey | null;
  tableNumber: string | null;
  demoUrl: string | null;
  finalist: boolean;
  /** Cuántas calificaciones enviadas lleva ya, en cualquier fase. */
  scores: number;
  /** Le falta sede o track: ningún panelista lo verá. */
  incomplete: boolean;
};

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "proyecto"
  );
}

/**
 * Alfabeto sin caracteres que se confunden al dictar: ni O/0, ni I/1/L.
 * Mismo criterio que el código de equipo del hacker — un proyecto creado por
 * staff también puede acabar necesitando que alguien se una.
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join(
    "",
  );
}

export async function listProjects(): Promise<Project[]> {
  const rows = await db
    .select({
      id: dashboardTeams.id,
      name: dashboardTeams.name,
      slug: dashboardTeams.slug,
      city: dashboardTeams.city,
      track: dashboardTeams.track,
      tableNumber: dashboardTeams.tableNumber,
      demoUrl: dashboardTeams.demoUrl,
      finalistAt: dashboardTeams.finalistAt,
      scores: sql<number>`(
        select count(*) from dashboard_scores s
        where s.team_id = ${dashboardTeams.id}
          and s.submitted_at is not null
      )`,
    })
    .from(dashboardTeams)
    .orderBy(asc(dashboardTeams.name));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    city: row.city,
    track: row.track,
    tableNumber: row.tableNumber,
    demoUrl: row.demoUrl,
    finalist: Boolean(row.finalistAt),
    scores: Number(row.scores),
    incomplete: !row.city || !row.track,
  }));
}

/** Slug libre. Reintenta con sufijo en vez de fallar: el staff está escribiendo. */
async function freeSlug(name: string): Promise<string> {
  const base = slugify(name);
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const [taken] = await db
      .select({ id: dashboardTeams.id })
      .from(dashboardTeams)
      .where(eq(dashboardTeams.slug, candidate))
      .limit(1);
    if (!taken) return candidate;
  }
  return `${base}-${randomCode().toLowerCase()}`;
}

export async function createProject(input: {
  name: string;
  city: CityKey;
  track: TrackKey;
  tableNumber: string | null;
  demoUrl: string | null;
}): Promise<string> {
  const [row] = await db
    .insert(dashboardTeams)
    .values({
      name: input.name,
      slug: await freeSlug(input.name),
      joinCode: randomCode(),
      city: input.city,
      track: input.track,
      // El track lo fija el staff aquí mismo, así que ya está confirmado: sin
      // esta marca el equipo quedaría a medias para el resto del dashboard.
      trackConfirmedAt: new Date(),
      tableNumber: input.tableNumber,
      demoUrl: input.demoUrl,
    })
    .returning({ id: dashboardTeams.id });

  return row.id;
}

/** Completar o corregir un proyecto. Solo toca lo que viene: el resto se queda. */
export async function updateProject(
  teamId: string,
  input: {
    city?: CityKey | null;
    track?: TrackKey | null;
    tableNumber?: string | null;
    demoUrl?: string | null;
  },
): Promise<void> {
  const changes: Record<string, unknown> = { updatedAt: new Date() };
  if (input.city !== undefined) changes.city = input.city;
  if (input.track !== undefined) {
    changes.track = input.track;
    changes.trackConfirmedAt = input.track ? new Date() : null;
  }
  if (input.tableNumber !== undefined) changes.tableNumber = input.tableNumber;
  if (input.demoUrl !== undefined) changes.demoUrl = input.demoUrl;

  await db
    .update(dashboardTeams)
    .set(changes)
    .where(eq(dashboardTeams.id, teamId));
}

/** Cuántos proyectos calificables hay por sede. Para el aviso de cobertura. */
export async function countScorableByCity(): Promise<Map<string, number>> {
  const rows = await db
    .select({
      city: dashboardTeams.city,
      total: sql<number>`count(*)`,
    })
    .from(dashboardTeams)
    .where(isNotNull(dashboardTeams.track))
    .groupBy(dashboardTeams.city);

  return new Map(
    rows.filter((r) => r.city).map((r) => [r.city as string, Number(r.total)]),
  );
}
