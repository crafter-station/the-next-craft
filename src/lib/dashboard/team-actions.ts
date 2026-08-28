"use server";

import { revalidatePath } from "next/cache";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { dashboardTeamMembers, dashboardTeams } from "@/lib/db/schema";

import { inviteParticipant, revokeParticipant } from "./github";
import { currentHacker } from "./state";
import { MAX_TEAM_SIZE } from "./team-limits";

export type TeamError =
  | "unauthenticated"
  | "no-participant"
  | "already-in-team"
  | "not-in-team"
  | "name-too-short"
  | "code-not-found"
  | "team-full"
  | "invalid-url";

type Result = { ok: true } | { ok: false; error: TeamError };

/**
 * Alfabeto sin caracteres que se confunden al dictar: ni O/0, ni I/1/L.
 * El código se lee en voz alta en una sala con 60 personas.
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join(
    "",
  );
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function refresh() {
  revalidatePath("/[locale]/dashboard", "layout");
}

export async function createTeam(rawName: string): Promise<Result> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (ctx.team) return { ok: false, error: "already-in-team" };

  const name = rawName.trim().replace(/\s+/g, " ");
  if (name.length < 2) return { ok: false, error: "name-too-short" };

  const base = slugify(name) || "equipo";

  // El slug y el código son únicos: si chocan, se reintenta con sufijo nuevo.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = randomCode().slice(0, 4).toLowerCase();
    const created = await db
      .insert(dashboardTeams)
      .values({
        slug: attempt === 0 ? base : `${base}-${suffix}`,
        name,
        joinCode: randomCode(),
        city: ctx.participant.city,
      })
      .onConflictDoNothing()
      .returning({ id: dashboardTeams.id });

    if (created.length === 0) continue;

    await db.insert(dashboardTeamMembers).values({
      teamId: created[0].id,
      participantId: ctx.participant.id,
      isCaptain: true,
    });
    refresh();
    return { ok: true };
  }

  return { ok: false, error: "name-too-short" };
}

export async function joinTeam(rawCode: string): Promise<Result> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (ctx.team) return { ok: false, error: "already-in-team" };

  const code = rawCode
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const [team] = await db
    .select({ id: dashboardTeams.id })
    .from(dashboardTeams)
    .where(eq(dashboardTeams.joinCode, code))
    .limit(1);
  if (!team) return { ok: false, error: "code-not-found" };

  // El cupo se comprueba dentro del INSERT: en el kickoff varias personas
  // entran con el mismo código al mismo tiempo.
  const inserted = await db.execute(sql`
    insert into dashboard_team_members (team_id, participant_id, is_captain)
    select ${team.id}, ${ctx.participant.id}, false
    where (
      select count(*) from dashboard_team_members m where m.team_id = ${team.id}
    ) < ${MAX_TEAM_SIZE}
    on conflict (participant_id) do nothing
    returning participant_id
  `);

  const rows = (inserted as unknown as { rows: unknown[] }).rows ?? [];
  if (rows.length === 0) return { ok: false, error: "team-full" };

  // Si el equipo ya tiene repo, la invitación sale sola: nadie tiene que
  // acordarse de pedírsela al capitán.
  await inviteParticipant(team.id, ctx.participant.id);

  refresh();
  return { ok: true };
}

export async function leaveTeam(): Promise<Result> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!ctx.team) return { ok: false, error: "not-in-team" };

  const teamId = ctx.team.id;
  // Antes de borrar la fila: la revocación necesita el id de la invitación.
  await revokeParticipant(teamId, ctx.participant.id);
  await db
    .delete(dashboardTeamMembers)
    .where(eq(dashboardTeamMembers.participantId, ctx.participant.id));

  const rest = await db
    .select({ participantId: dashboardTeamMembers.participantId })
    .from(dashboardTeamMembers)
    .where(eq(dashboardTeamMembers.teamId, teamId));

  if (rest.length === 0) {
    // Equipo vacío: se borra. Deja libre el nombre y el código.
    await db.delete(dashboardTeams).where(eq(dashboardTeams.id, teamId));
  } else {
    // Si se fue quien era capitán, asciende alguien para no dejarlo huérfano.
    const captains = await db
      .select({ participantId: dashboardTeamMembers.participantId })
      .from(dashboardTeamMembers)
      .where(
        and(
          eq(dashboardTeamMembers.teamId, teamId),
          eq(dashboardTeamMembers.isCaptain, true),
        ),
      );
    if (captains.length === 0) {
      await db
        .update(dashboardTeamMembers)
        .set({ isCaptain: true })
        .where(
          and(
            eq(dashboardTeamMembers.teamId, teamId),
            eq(dashboardTeamMembers.participantId, rest[0].participantId),
          ),
        );
    }
  }

  refresh();
  return { ok: true };
}

/** Nombre, pitch y links del proyecto: lo que mira el jurado en la entrega. */
export async function updateTeamDetails(input: {
  name: string;
  pitch: string;
  repoUrl: string;
  demoUrl: string;
}): Promise<Result> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!ctx.team) return { ok: false, error: "not-in-team" };

  const name = input.name.trim().replace(/\s+/g, " ");
  if (name.length < 2) return { ok: false, error: "name-too-short" };

  const links: { repoUrl: string | null; demoUrl: string | null } = {
    repoUrl: null,
    demoUrl: null,
  };
  for (const key of ["repoUrl", "demoUrl"] as const) {
    const raw = input[key].trim();
    if (!raw) continue;
    try {
      const url = new URL(raw);
      if (url.protocol !== "https:") return { ok: false, error: "invalid-url" };
      links[key] = url.toString();
    } catch {
      return { ok: false, error: "invalid-url" };
    }
  }

  await db
    .update(dashboardTeams)
    .set({
      name,
      pitch: input.pitch.trim() || null,
      repoUrl: links.repoUrl,
      demoUrl: links.demoUrl,
      updatedAt: new Date(),
    })
    .where(eq(dashboardTeams.id, ctx.team.id));

  refresh();
  return { ok: true };
}
