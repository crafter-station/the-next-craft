"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq, isNull, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import type { CityKey } from "@/lib/cities";
import { db } from "@/lib/db";
import {
  dashboardAgendaSaves,
  dashboardPartnerRedemptions,
  dashboardTeams,
} from "@/lib/db/schema";
import type { TrackKey } from "@/lib/db/schema-types";

import { trackCapacity } from "./capacity";
import { agendaMetaByTime, PARTNERS, TRACKS } from "./content";
import { refreshRepoTopics } from "./github";
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
  | "unknown-block"
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
 * Confirmar cierra el track del equipo y ocupa una plaza del cupo de la sede.
 *
 * El recuento va **dentro** del UPDATE, no en un `select` previo: en el
 * kickoff hay decenas de equipos confirmando a la vez y entre leer el contador
 * y escribir la confirmación caben varios. Así la comprobación y la escritura
 * son la misma sentencia y el cupo no se puede pasar.
 */
export async function confirmTrack(): Promise<ActionResult> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!ctx.team) return { ok: false, error: "no-team" };

  const track = ctx.team.track;
  if (!track) return { ok: false, error: "track-locked" };

  const capacity = trackCapacity(ctx.team.city, track);

  // Sin sede no hay cupo contra el que medir. Es el caso de un equipo cuyo
  // capitán se registró sin ciudad: preferimos dejarlo confirmar a bloquearlo
  // por un dato que él no controla.
  const updated =
    capacity === null
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
                  where t.city = ${ctx.team.city}
                    and t.track = ${track}::dashboard_track
                    and t.track_confirmed_at is not null
               ) < ${capacity}
            returning id
          `)
        ).rows ?? []);

  if (updated.length === 0) {
    // Distinguimos «lleno» de «ya confirmado» para poder decir cuál de las dos
    // cosas pasó: en el kickoff son dos mensajes muy distintos.
    if (capacity !== null) {
      const taken = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(dashboardTeams)
        .where(
          and(
            eq(dashboardTeams.city, ctx.team.city as CityKey),
            eq(dashboardTeams.track, track),
            sql`${dashboardTeams.trackConfirmedAt} is not null`,
          ),
        );
      if ((taken[0]?.total ?? 0) >= capacity) {
        return { ok: false, error: "track-full" };
      }
    }
    return { ok: false, error: "track-locked" };
  }

  // `tnc26-<track>` es como los mentores filtran la org, y el track se confirma
  // después de crear el repo tan a menudo como antes.
  await refreshRepoTopics(ctx.team.id);

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

  await refreshRepoTopics(ctx.team.id);

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

/* ── Mi agenda ─────────────────────────────────────────────── */

export async function toggleAgendaBlock(
  eventTime: string,
): Promise<ActionResult> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!agendaMetaByTime.has(eventTime)) {
    return { ok: false, error: "unknown-block" };
  }

  const removed = await db
    .delete(dashboardAgendaSaves)
    .where(
      and(
        eq(dashboardAgendaSaves.participantId, ctx.participant.id),
        eq(dashboardAgendaSaves.eventTime, eventTime),
      ),
    )
    .returning({ eventTime: dashboardAgendaSaves.eventTime });

  if (removed.length === 0) {
    await db
      .insert(dashboardAgendaSaves)
      .values({ participantId: ctx.participant.id, eventTime })
      .onConflictDoNothing();
  }

  refreshDashboard();
  return { ok: true };
}
