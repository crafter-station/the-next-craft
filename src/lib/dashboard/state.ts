import { and, asc, eq, inArray, sql } from "drizzle-orm";

import type { CityKey } from "@/lib/cities";
import { db } from "@/lib/db";
import {
  badgeParticipants,
  dashboardAgendaSaves,
  dashboardCheckins,
  dashboardMentorSlots,
  dashboardMentorTables,
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
  tableNumber: string | null;
  pitch: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  track: TrackKey | null;
  trackConfirmedAt: Date | null;
  mentorTableId: string | null;
  members: {
    participantId: string;
    fullName: string;
    role: string | null;
    isCaptain: boolean;
  }[];
};

export type MentorTableView = {
  id: string;
  slug: string;
  org: string;
  role: string;
  bio: string | null;
  expertise: string[];
  teamCapacity: number;
  teamsAssigned: number;
  slots: {
    id: string;
    startsAt: string;
    endsAt: string;
    takenByMyTeam: boolean;
    taken: boolean;
    topic: string | null;
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

/** Equipos inscritos por track, para el contador de la página de tracks. */
export async function countTeamsByTrack() {
  const rows = await db
    .select({ track: dashboardTeams.track, total: sql<number>`count(*)::int` })
    .from(dashboardTeams)
    .where(sql`${dashboardTeams.trackConfirmedAt} is not null`)
    .groupBy(dashboardTeams.track);

  const counts = new Map<TrackKey, number>(TRACKS.map((t) => [t.key, 0]));
  for (const row of rows) {
    if (row.track) counts.set(row.track, row.total);
  }
  return counts;
}

export async function listMentorTables(
  myTeamId: string | null,
): Promise<MentorTableView[]> {
  const tables = await db
    .select()
    .from(dashboardMentorTables)
    .orderBy(
      asc(dashboardMentorTables.sortOrder),
      asc(dashboardMentorTables.org),
    );
  if (tables.length === 0) return [];

  const ids = tables.map((t) => t.id);

  const slots = await db
    .select()
    .from(dashboardMentorSlots)
    .where(inArray(dashboardMentorSlots.mentorTableId, ids))
    .orderBy(asc(dashboardMentorSlots.startsAt));

  const assigned = await db
    .select({
      mentorTableId: dashboardTeams.mentorTableId,
      total: sql<number>`count(*)::int`,
    })
    .from(dashboardTeams)
    .where(inArray(dashboardTeams.mentorTableId, ids))
    .groupBy(dashboardTeams.mentorTableId);

  const assignedByTable = new Map(
    assigned.map((a) => [a.mentorTableId as string, a.total]),
  );

  return tables.map((t) => ({
    id: t.id,
    slug: t.slug,
    org: t.org,
    role: t.role,
    bio: t.bio,
    expertise: t.expertise,
    teamCapacity: t.teamCapacity,
    teamsAssigned: assignedByTable.get(t.id) ?? 0,
    slots: slots
      .filter((s) => s.mentorTableId === t.id)
      .map((s) => ({
        id: s.id,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        taken: s.teamId !== null,
        takenByMyTeam: Boolean(myTeamId) && s.teamId === myTeamId,
        topic: s.teamId === myTeamId ? s.topic : null,
      })),
  }));
}

export async function listMyBookings(teamId: string | null) {
  if (!teamId) return [];
  return db
    .select({
      slotId: dashboardMentorSlots.id,
      startsAt: dashboardMentorSlots.startsAt,
      endsAt: dashboardMentorSlots.endsAt,
      topic: dashboardMentorSlots.topic,
      org: dashboardMentorTables.org,
      role: dashboardMentorTables.role,
    })
    .from(dashboardMentorSlots)
    .innerJoin(
      dashboardMentorTables,
      eq(dashboardMentorTables.id, dashboardMentorSlots.mentorTableId),
    )
    .where(eq(dashboardMentorSlots.teamId, teamId))
    .orderBy(asc(dashboardMentorSlots.startsAt));
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

/** ¿El turno pedido choca con otro que el equipo ya tiene a la misma hora? */
export async function hasBookingAt(teamId: string, startsAt: string) {
  const [row] = await db
    .select({ id: dashboardMentorSlots.id })
    .from(dashboardMentorSlots)
    .where(
      and(
        eq(dashboardMentorSlots.teamId, teamId),
        eq(dashboardMentorSlots.startsAt, startsAt),
      ),
    )
    .limit(1);
  return Boolean(row);
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
