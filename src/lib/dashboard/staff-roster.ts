import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

import type { CityKey } from "@/lib/cities";
import { db } from "@/lib/db";
import {
  badgeParticipants,
  dashboardCheckins,
  dashboardTeamMembers,
  dashboardTeams,
  participantProfiles,
} from "@/lib/db/schema";

export type RosterEntry = {
  participantId: string;
  fullName: string;
  email: string;
  city: CityKey | null;
  participantNumber: number | null;
  hasBadge: boolean;
  teamName: string | null;
  arrivedAt: Date | null;
  merchDeliveredAt: Date | null;
};

/**
 * Lista de acreditados para la puerta. Filtra en SQL, no en memoria: son 300
 * personas hoy, pero el staff busca con el móvil y una mano ocupada.
 */
export async function listRoster(options: {
  city?: CityKey | null;
  search?: string | null;
}): Promise<RosterEntry[]> {
  const search = options.search?.trim();

  const filters = [
    options.city ? eq(badgeParticipants.city, options.city) : undefined,
    search
      ? or(
          ilike(badgeParticipants.fullName, `%${search}%`),
          ilike(badgeParticipants.email, `%${search}%`),
        )
      : undefined,
  ].filter(Boolean);

  return db
    .select({
      participantId: badgeParticipants.id,
      fullName: badgeParticipants.fullName,
      email: badgeParticipants.email,
      city: badgeParticipants.city,
      participantNumber: participantProfiles.participantNumber,
      // Tener badge generado es la señal de que confirmó asistencia.
      hasBadge: sql<boolean>`exists (
        select 1 from badge_attempts a
        where a.participant_id = ${badgeParticipants.id}
          and a.status = 'completed'
      )`,
      teamName: dashboardTeams.name,
      arrivedAt: dashboardCheckins.arrivedAt,
      merchDeliveredAt: dashboardCheckins.merchDeliveredAt,
    })
    .from(badgeParticipants)
    .leftJoin(
      participantProfiles,
      eq(participantProfiles.participantId, badgeParticipants.id),
    )
    .leftJoin(
      dashboardTeamMembers,
      eq(dashboardTeamMembers.participantId, badgeParticipants.id),
    )
    .leftJoin(
      dashboardTeams,
      eq(dashboardTeams.id, dashboardTeamMembers.teamId),
    )
    .leftJoin(
      dashboardCheckins,
      eq(dashboardCheckins.participantId, badgeParticipants.id),
    )
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(asc(badgeParticipants.fullName));
}

export type RosterTotals = {
  expected: number;
  arrived: number;
  merch: number;
  withBadge: number;
};

/** Contadores de la sede: siempre del total, no de lo que filtró el buscador. */
export async function rosterTotals(
  city: CityKey | null,
): Promise<RosterTotals> {
  const where = city ? eq(badgeParticipants.city, city) : undefined;

  const [row] = await db
    .select({
      expected: sql<number>`count(*)::int`,
      arrived: sql<number>`count(${dashboardCheckins.arrivedAt})::int`,
      merch: sql<number>`count(${dashboardCheckins.merchDeliveredAt})::int`,
      withBadge: sql<number>`count(*) filter (where exists (
        select 1 from badge_attempts a
        where a.participant_id = ${badgeParticipants.id}
          and a.status = 'completed'
      ))::int`,
    })
    .from(badgeParticipants)
    .leftJoin(
      dashboardCheckins,
      eq(dashboardCheckins.participantId, badgeParticipants.id),
    )
    .where(where);

  return row ?? { expected: 0, arrived: 0, merch: 0, withBadge: 0 };
}
