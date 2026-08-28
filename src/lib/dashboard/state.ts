import { and, asc, eq, sql } from "drizzle-orm";

import type { CityKey } from "@/lib/cities";
import { db } from "@/lib/db";
import {
  badgeParticipants,
  dashboardAgendaSaves,
  dashboardCheckins,
  dashboardPartnerRedemptions,
  dashboardTeamMembers,
  dashboardTeams,
} from "@/lib/db/schema";
import type { TrackKey } from "@/lib/db/schema-types";

import { PARTNERS, TRACKS } from "./content";

export type DashboardParticipant = {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  city: CityKey | null;
  shareToken: string;
  participantNumber: number | null;
};

export type DashboardTeam = {
  id: string;
  slug: string;
  name: string;
  joinCode: string;
  /** La sede del equipo: de ella sale el cupo de track. */
  city: CityKey | null;
  tableNumber: string | null;
  pitch: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  track: TrackKey | null;
  trackConfirmedAt: Date | null;
  members: {
    participantId: string;
    fullName: string;
    role: string | null;
    isCaptain: boolean;
  }[];
};

/** El participante acreditado detrás de la sesión de better-auth. */
export async function findParticipantByUserId(
  userId: string,
): Promise<DashboardParticipant | null> {
  const rows = await db
    .select({
      id: badgeParticipants.id,
      userId: badgeParticipants.userId,
      email: badgeParticipants.email,
      fullName: badgeParticipants.fullName,
      city: badgeParticipants.city,
      shareToken: badgeParticipants.shareToken,
      participantNumber: sql<number | null>`(
        select pp.participant_number from participant_profiles pp
        where pp.participant_id = ${badgeParticipants.id}
      )`,
    })
    .from(badgeParticipants)
    .where(eq(badgeParticipants.userId, userId))
    .limit(1);

  return rows[0] ?? null;
}

export type PerkEligibility = {
  hasBadge: boolean;
  arrived: boolean;
  canRedeem: boolean;
};

/** Perks solo se canjean con badge completado y check-in presencial en sede. */
export async function getParticipantPerkEligibility(
  participantId: string,
): Promise<PerkEligibility> {
  const [row] = await db
    .select({
      hasBadge: sql<boolean>`exists (
        select 1 from badge_attempts a
        where a.participant_id = ${participantId}
          and a.status = 'completed'
      )`,
      arrivedAt: dashboardCheckins.arrivedAt,
    })
    .from(badgeParticipants)
    .leftJoin(
      dashboardCheckins,
      eq(dashboardCheckins.participantId, badgeParticipants.id),
    )
    .where(eq(badgeParticipants.id, participantId))
    .limit(1);

  const hasBadge = row?.hasBadge ?? false;
  const arrived = Boolean(row?.arrivedAt);
  return { hasBadge, arrived, canRedeem: hasBadge && arrived };
}

export async function findTeamForParticipant(
  participantId: string,
): Promise<DashboardTeam | null> {
  const membership = await db
    .select({ teamId: dashboardTeamMembers.teamId })
    .from(dashboardTeamMembers)
    .where(eq(dashboardTeamMembers.participantId, participantId))
    .limit(1);

  const teamId = membership[0]?.teamId;
  if (!teamId) return null;

  const [team] = await db
    .select()
    .from(dashboardTeams)
    .where(eq(dashboardTeams.id, teamId))
    .limit(1);
  if (!team) return null;

  const members = await db
    .select({
      participantId: dashboardTeamMembers.participantId,
      role: dashboardTeamMembers.role,
      isCaptain: dashboardTeamMembers.isCaptain,
      fullName: badgeParticipants.fullName,
    })
    .from(dashboardTeamMembers)
    .innerJoin(
      badgeParticipants,
      eq(badgeParticipants.id, dashboardTeamMembers.participantId),
    )
    .where(eq(dashboardTeamMembers.teamId, teamId))
    .orderBy(asc(dashboardTeamMembers.joinedAt));

  return { ...team, members };
}

/**
 * Equipos con track confirmado, contados **dentro de una sede**.
 *
 * El cupo es por sede: que Lima llene «Content Machine» no puede cerrarle el
 * track a Bogotá. Sin sede no hay contra qué contar y devolvemos ceros, que es
 * lo mismo que decir «sin límite» aguas arriba.
 */
export async function countTeamsByTrack(city: CityKey | null) {
  const counts = new Map<TrackKey, number>(TRACKS.map((t) => [t.key, 0]));
  if (!city) return counts;

  const rows = await db
    .select({ track: dashboardTeams.track, total: sql<number>`count(*)::int` })
    .from(dashboardTeams)
    .where(
      and(
        eq(dashboardTeams.city, city),
        sql`${dashboardTeams.trackConfirmedAt} is not null`,
      ),
    )
    .groupBy(dashboardTeams.track);

  for (const row of rows) {
    if (row.track) counts.set(row.track, row.total);
  }
  return counts;
}

export async function listRedeemedPartners(participantId: string) {
  const rows = await db
    .select({
      partnerKey: dashboardPartnerRedemptions.partnerKey,
      redeemedAt: dashboardPartnerRedemptions.redeemedAt,
    })
    .from(dashboardPartnerRedemptions)
    .where(eq(dashboardPartnerRedemptions.participantId, participantId));

  const known = new Set(PARTNERS.map((p) => p.key));
  return new Map(
    rows
      .filter((r) => known.has(r.partnerKey))
      .map((r) => [r.partnerKey, r.redeemedAt]),
  );
}

export async function listSavedAgenda(participantId: string) {
  const rows = await db
    .select({ eventTime: dashboardAgendaSaves.eventTime })
    .from(dashboardAgendaSaves)
    .where(eq(dashboardAgendaSaves.participantId, participantId));
  return new Set(rows.map((r) => r.eventTime));
}

/** Cuántos equipos hay en la sede, para el contador de la página de equipo. */
export async function countTeamsInCity(city: CityKey | null) {
  if (!city) return 0;
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(dashboardTeams)
    .where(eq(dashboardTeams.city, city));
  return row?.n ?? 0;
}
