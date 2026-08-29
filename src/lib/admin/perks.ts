import { and, asc, eq, sql } from "drizzle-orm";

import { PARTNERS, partnerByKey } from "@/lib/dashboard/content";
import { db } from "@/lib/db";
import {
  badgeAttempts,
  badgeParticipants,
  participantPartnerCodes,
  participantProfiles,
} from "@/lib/db/schema";

export type PartnerCodeStats = {
  partnerKey: string;
  partnerName: string;
  confirmed: number;
  assigned: number;
  unassigned: number;
};

const SHARED_PARTNER_CODES = new Map([
  ["tavily", "TVLY-4XBA8FDS"],
  ["apify", "NEXT_CRAFT_LATAM"],
  ["vapi", "thenextcraftperuvapi"],
  ["replit", "MASTER-DEV-VIBES"],
  ["n8n", "2026-COMMUNITY-HACKATHON-LATAM-144E6300"],
]);

/** Participantes con badge completado (confirmaron asistencia). */
export async function countConfirmedParticipants() {
  const [row] = await db
    .select({ n: sql<number>`count(distinct ${badgeParticipants.id})::int` })
    .from(badgeParticipants)
    .innerJoin(
      badgeAttempts,
      and(
        eq(badgeAttempts.participantId, badgeParticipants.id),
        eq(badgeAttempts.status, "completed"),
      ),
    );
  return row?.n ?? 0;
}

export async function partnerCodeStats(): Promise<PartnerCodeStats[]> {
  const confirmed = await countConfirmedParticipants();

  const assignedRows = await db
    .select({
      partnerKey: participantPartnerCodes.partnerKey,
      total: sql<number>`count(*)::int`,
    })
    .from(participantPartnerCodes)
    .groupBy(participantPartnerCodes.partnerKey);

  const assignedByPartner = new Map(
    assignedRows.map((row) => [row.partnerKey, row.total]),
  );

  return PARTNERS.map((partner) => {
    const assigned = SHARED_PARTNER_CODES.has(partner.key)
      ? confirmed
      : (assignedByPartner.get(partner.key) ?? 0);
    return {
      partnerKey: partner.key,
      partnerName: partner.name,
      confirmed,
      assigned,
      unassigned: Math.max(confirmed - assigned, 0),
    };
  });
}

export async function listAssignedCodesForParticipant(participantId: string) {
  const rows = await db
    .select({
      partnerKey: participantPartnerCodes.partnerKey,
      code: participantPartnerCodes.code,
    })
    .from(participantPartnerCodes)
    .where(eq(participantPartnerCodes.participantId, participantId));

  return new Map([
    ...rows.map((row) => [row.partnerKey, row.code] as const),
    ...SHARED_PARTNER_CODES,
  ]);
}

export async function findParticipantIdByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const [row] = await db
    .select({ id: badgeParticipants.id })
    .from(badgeParticipants)
    .where(eq(badgeParticipants.email, normalized))
    .limit(1);
  return row?.id ?? null;
}

/**
 * Confirmados sin código para un partner, en orden de número de participante.
 * Solo los que ya generaron badge.
 */
export async function listUnassignedConfirmedParticipantIds(
  partnerKey: string,
  limit: number,
) {
  if (limit <= 0) return [];

  const rows = await db
    .select({ id: badgeParticipants.id })
    .from(badgeParticipants)
    .innerJoin(
      badgeAttempts,
      and(
        eq(badgeAttempts.participantId, badgeParticipants.id),
        eq(badgeAttempts.status, "completed"),
      ),
    )
    .leftJoin(
      participantPartnerCodes,
      and(
        eq(participantPartnerCodes.participantId, badgeParticipants.id),
        eq(participantPartnerCodes.partnerKey, partnerKey),
      ),
    )
    .leftJoin(
      participantProfiles,
      eq(participantProfiles.participantId, badgeParticipants.id),
    )
    .where(sql`${participantPartnerCodes.participantId} is null`)
    .orderBy(asc(participantProfiles.participantNumber))
    .limit(limit);

  return rows.map((row) => row.id);
}

export function isKnownPartnerKey(partnerKey: string) {
  return partnerByKey.has(partnerKey);
}

export async function existingCodesForPartner(partnerKey: string) {
  const rows = await db
    .select({ code: participantPartnerCodes.code })
    .from(participantPartnerCodes)
    .where(eq(participantPartnerCodes.partnerKey, partnerKey));
  return new Set(rows.map((row) => row.code));
}

export async function participantsWithCodes(partnerKey: string) {
  const rows = await db
    .select({ participantId: participantPartnerCodes.participantId })
    .from(participantPartnerCodes)
    .where(eq(participantPartnerCodes.partnerKey, partnerKey));
  return new Set(rows.map((row) => row.participantId));
}

export async function insertPartnerCode(values: {
  participantId: string;
  partnerKey: string;
  code: string;
  assignedByEmail: string;
}) {
  await db.insert(participantPartnerCodes).values({
    participantId: values.participantId,
    partnerKey: values.partnerKey,
    code: values.code,
    assignedByEmail: values.assignedByEmail,
  });
}

/** Reserva de forma atómica un código del pool, o devuelve el ya reservado. */
export async function claimPartnerCode(
  participantId: string,
  partnerKey: string,
) {
  const result = await db.execute(sql`
    with participant_lock as materialized (
      select pg_advisory_xact_lock(
        hashtextextended(${participantId}::text, 0)
      )
    ),
    existing as materialized (
      select assigned.code
      from participant_partner_codes assigned
      cross join participant_lock
      where assigned.participant_id = ${participantId}
        and assigned.partner_key = ${partnerKey}
      limit 1
    ),
    available as materialized (
      select pool.code
      from partner_code_pool pool
      cross join participant_lock
      left join participant_partner_codes assigned
        on assigned.partner_key = pool.partner_key
        and assigned.code = pool.code
      where pool.partner_key = ${partnerKey}
        and assigned.code is null
        and not exists (select 1 from existing)
      order by pool.code
      for update of pool skip locked
      limit 1
    ),
    inserted as (
      insert into participant_partner_codes (participant_id, partner_key, code)
      select ${participantId}, ${partnerKey}, available.code
      from available
      on conflict do nothing
      returning code
    )
    select code from existing
    union all
    select code from inserted
    limit 1
  `);

  const rows = (result as unknown as { rows: { code: string }[] }).rows ?? [];
  return rows[0]?.code ?? null;
}
