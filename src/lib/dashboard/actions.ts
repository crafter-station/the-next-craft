"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq, isNull, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  dashboardAgendaSaves,
  dashboardMentorSlots,
  dashboardPartnerRedemptions,
  dashboardTeams,
} from "@/lib/db/schema";
import type { TrackKey } from "@/lib/db/schema-types";

import { agendaMetaByTime, PARTNERS, TRACKS } from "./content";
import {
  findParticipantByUserId,
  findTeamForParticipant,
  getParticipantPerkEligibility,
  hasBookingAt,
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
  | "slot-taken"
  | "slot-missing"
  | "time-clash"
  | "topic-too-short"
  | "table-full"
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

export async function confirmTrack(): Promise<ActionResult> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!ctx.team) return { ok: false, error: "no-team" };

  const updated = await db
    .update(dashboardTeams)
    .set({ trackConfirmedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(dashboardTeams.id, ctx.team.id),
        isNull(dashboardTeams.trackConfirmedAt),
        sql`${dashboardTeams.track} is not null`,
      ),
    )
    .returning({ id: dashboardTeams.id });

  if (updated.length === 0) return { ok: false, error: "track-locked" };
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

/* ── Mesa de mentoría del equipo ───────────────────────────── */

export async function assignMentorTable(
  mentorTableId: string,
): Promise<ActionResult> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!ctx.team) return { ok: false, error: "no-team" };

  // Cupo comprobado dentro del UPDATE: sin transacciones (neon-http), esta es
  // la forma de que dos equipos no entren a la vez en la última plaza.
  const updated = await db
    .update(dashboardTeams)
    .set({ mentorTableId, updatedAt: new Date() })
    .where(
      and(
        eq(dashboardTeams.id, ctx.team.id),
        sql`(
          select count(*) from dashboard_teams t
          where t.mentor_table_id = ${mentorTableId} and t.id <> ${ctx.team.id}
        ) < (
          select team_capacity from dashboard_mentor_tables
          where id = ${mentorTableId}
        )`,
      ),
    )
    .returning({ id: dashboardTeams.id });

  if (updated.length === 0) return { ok: false, error: "table-full" };
  refreshDashboard();
  return { ok: true };
}

export async function releaseMentorTable(): Promise<ActionResult> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!ctx.team) return { ok: false, error: "no-team" };

  await db
    .update(dashboardTeams)
    .set({ mentorTableId: null, updatedAt: new Date() })
    .where(eq(dashboardTeams.id, ctx.team.id));

  refreshDashboard();
  return { ok: true };
}

/* ── Turnos de mentoría ────────────────────────────────────── */

export async function bookMentorSlot(
  slotId: string,
  topic: string,
): Promise<ActionResult> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!ctx.team) return { ok: false, error: "no-team" };

  const trimmed = topic.trim();
  if (trimmed.length < 10) return { ok: false, error: "topic-too-short" };

  const [slot] = await db
    .select({ startsAt: dashboardMentorSlots.startsAt })
    .from(dashboardMentorSlots)
    .where(eq(dashboardMentorSlots.id, slotId))
    .limit(1);
  if (!slot) return { ok: false, error: "slot-missing" };

  if (await hasBookingAt(ctx.team.id, slot.startsAt)) {
    return { ok: false, error: "time-clash" };
  }

  // `where team_id is null` hace la reserva atómica.
  const taken = await db
    .update(dashboardMentorSlots)
    .set({ teamId: ctx.team.id, topic: trimmed, bookedAt: new Date() })
    .where(
      and(
        eq(dashboardMentorSlots.id, slotId),
        isNull(dashboardMentorSlots.teamId),
      ),
    )
    .returning({ id: dashboardMentorSlots.id });

  if (taken.length === 0) return { ok: false, error: "slot-taken" };
  refreshDashboard();
  return { ok: true };
}

export async function cancelMentorSlot(slotId: string): Promise<ActionResult> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!ctx.team) return { ok: false, error: "no-team" };

  await db
    .update(dashboardMentorSlots)
    .set({ teamId: null, topic: null, bookedAt: null })
    .where(
      and(
        eq(dashboardMentorSlots.id, slotId),
        eq(dashboardMentorSlots.teamId, ctx.team.id),
      ),
    );

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
