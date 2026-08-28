"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq, isNull, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  dashboardPartnerRedemptions,
  dashboardTeams,
} from "@/lib/db/schema";
import type { TrackKey } from "@/lib/db/schema-types";

import { balanceApplies, TRACK_BALANCE_SLACK } from "./capacity";
import { PARTNERS, TRACKS } from "./content";
import {
  findParticipantByUserId,
  findTeamForParticipant,
  getParticipantPerkEligibility,
} from "./state";

type ActionResult = { ok: true } | { ok: false; error: DashboardError };

/**
 * Códigos de error, no frases: el texto lo traduce la interfaz con
 * `dashboard.errors.<code>`.
 */
export type DashboardError =
  | "unauthenticated"
  | "no-participant"
  | "no-team"
  | "track-locked"
  | "unknown-track"
  | "track-full"
  | "unknown-partner"
  | "perks-locked";

type HackerContext =
  | { error: DashboardError }
  | {
      error?: undefined;
      participant: Awaited<ReturnType<typeof findParticipantByUserId>> & object;
      team: Awaited<ReturnType<typeof findTeamForParticipant>>;
    };

async function currentHacker(): Promise<HackerContext> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "unauthenticated" };

  const participant = await findParticipantByUserId(session.user.id);
  if (!participant) return { error: "no-participant" };

  const team = await findTeamForParticipant(participant.id);
  return { participant, team };
}

function refreshDashboard() {
  revalidatePath("/[locale]/dashboard", "layout");
}

/* ── Tracks ────────────────────────────────────────────────── */

export async function selectTrack(track: TrackKey): Promise<ActionResult> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!ctx.team) return { ok: false, error: "no-team" };
  if (!TRACKS.some((t) => t.key === track)) {
    return { ok: false, error: "unknown-track" };
  }

  // Un track confirmado no se cambia desde aquí: hay que liberarlo primero.
  const updated = await db
    .update(dashboardTeams)
    .set({ track, updatedAt: new Date() })
    .where(
      and(
        eq(dashboardTeams.id, ctx.team.id),
        isNull(dashboardTeams.trackConfirmedAt),
      ),
    )
    .returning({ id: dashboardTeams.id });

  if (updated.length === 0) return { ok: false, error: "track-locked" };
  refreshDashboard();
  return { ok: true };
}

/**
 * Confirmar cierra el track del equipo y cuenta para el equilibrio de su sede.
 *
 * No hay cupo total —cuántos equipos habrá no se sabe hasta que se forman, en
 * el propio kickoff—, así que el freno es relativo: un track se cierra cuando
 * va más de `TRACK_BALANCE_SLACK` por encima del reparto equitativo de los
 * equipos que ya confirmaron en esa sede. El techo sube solo según entra gente.
 *
 * Todo el cálculo va **dentro** del UPDATE, no en un `select` previo: en el
 * kickoff confirman decenas a la vez, y entre leer los contadores y escribir la
 * confirmación caben varios equipos. Aquí comprobación y escritura son la misma
 * sentencia, así que el desequilibrio no se puede colar por una carrera.
 */
export async function confirmTrack(): Promise<ActionResult> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!ctx.team) return { ok: false, error: "no-team" };

  const track = ctx.team.track;
  if (!track) return { ok: false, error: "track-locked" };
  const city = ctx.team.city;

  // Sin sede no hay grupo contra el que equilibrar. Es el caso de un equipo
  // cuyo capitán se registró sin ciudad: preferimos dejarlo confirmar antes que
  // bloquearlo por un dato que él no controla.
  const updated = !balanceApplies(city)
    ? await db
        .update(dashboardTeams)
        .set({ trackConfirmedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(dashboardTeams.id, ctx.team.id),
            isNull(dashboardTeams.trackConfirmedAt),
            sql`${dashboardTeams.track} is not null`,
          ),
        )
        .returning({ id: dashboardTeams.id })
    : ((
        await db.execute(sql`
          update dashboard_teams
             set track_confirmed_at = now(), updated_at = now()
           where id = ${ctx.team.id}
             and track_confirmed_at is null
             and track is not null
             and (
               select count(*) from dashboard_teams t
                where t.city = ${city}
                  and t.track = ${track}::dashboard_track
                  and t.track_confirmed_at is not null
             ) < (
               ceil((
                 (select count(*) from dashboard_teams t
                   where t.city = ${city}
                     and t.track_confirmed_at is not null) + 1
               )::numeric / ${TRACKS.length}) + ${TRACK_BALANCE_SLACK}
             )
          returning id
        `)
      ).rows ?? []);

  if (updated.length === 0) {
    // Distinguir «desequilibrado» de «ya confirmado»: en el kickoff son dos
    // mensajes muy distintos y el hacker tiene que saber cuál le toca.
    if (balanceApplies(city)) {
      const [row] = await db
        .select({
          inTrack: sql<number>`count(*) filter (where ${dashboardTeams.track} = ${track})::int`,
          inHub: sql<number>`count(*)::int`,
        })
        .from(dashboardTeams)
        .where(
          and(
            eq(dashboardTeams.city, city),
            sql`${dashboardTeams.trackConfirmedAt} is not null`,
          ),
        );
      const limit =
        Math.ceil(((row?.inHub ?? 0) + 1) / TRACKS.length) +
        TRACK_BALANCE_SLACK;
      if ((row?.inTrack ?? 0) >= limit) {
        return { ok: false, error: "track-full" };
      }
    }
    return { ok: false, error: "track-locked" };
  }

  refreshDashboard();
  return { ok: true };
}

export async function releaseTrack(): Promise<ActionResult> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!ctx.team) return { ok: false, error: "no-team" };

  await db
    .update(dashboardTeams)
    .set({ track: null, trackConfirmedAt: null, updatedAt: new Date() })
    .where(eq(dashboardTeams.id, ctx.team.id));

  refreshDashboard();
  return { ok: true };
}

/* ── Créditos de partners ──────────────────────────────────── */

export async function redeemPartner(partnerKey: string): Promise<ActionResult> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!PARTNERS.some((p) => p.key === partnerKey)) {
    return { ok: false, error: "unknown-partner" };
  }

  const eligibility = await getParticipantPerkEligibility(ctx.participant.id);
  if (!eligibility.canRedeem) {
    return { ok: false, error: "perks-locked" };
  }

  await db
    .insert(dashboardPartnerRedemptions)
    .values({ participantId: ctx.participant.id, partnerKey })
    .onConflictDoNothing();

  refreshDashboard();
  return { ok: true };
}
