import { and, asc, desc, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  badgeAttempts,
  type ParticipantProfileLink,
  participantProfiles,
} from "@/lib/db/schema";

export type PublicParticipantProfile = {
  participantNumber: number;
  displayName: string;
  bio: string | null;
  links: ParticipantProfileLink[];
  published: boolean;
  updatedAt: string;
};

export type PublishedParticipantCard = {
  participantNumber: number;
  displayName: string;
  updatedAt: string;
};

export function formatParticipantNumber(participantNumber: number) {
  return participantNumber.toString().padStart(3, "0");
}

export function parseParticipantNumber(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const participantNumber = Number(value);
  if (!Number.isSafeInteger(participantNumber) || participantNumber < 1)
    return null;
  return participantNumber;
}

export function participantProfilePath(
  participantNumber: number,
  locale = "es",
) {
  return `/${locale}/participant/${formatParticipantNumber(participantNumber)}`;
}

export function galleryPath(locale = "es") {
  return `/${locale}/gallery`;
}

export function participantBadgeImagePath(
  participantNumber: number,
  updatedAt: Date | string,
  width?: number,
) {
  const formattedNumber = formatParticipantNumber(participantNumber);
  const version =
    updatedAt instanceof Date ? updatedAt.getTime() : Date.parse(updatedAt);
  const params = new URLSearchParams({ v: String(version) });
  if (width) params.set("w", String(width));
  return `/api/badge/image/${formattedNumber}?${params.toString()}`;
}

export async function findPublishedParticipant(participantNumber: number) {
  const [participant] = await db
    .select({
      participantNumber: participantProfiles.participantNumber,
      displayName: participantProfiles.displayName,
      bio: participantProfiles.bio,
      links: participantProfiles.links,
      updatedAt: participantProfiles.updatedAt,
    })
    .from(participantProfiles)
    .innerJoin(
      badgeAttempts,
      eq(badgeAttempts.participantId, participantProfiles.participantId),
    )
    .where(
      and(
        eq(participantProfiles.participantNumber, participantNumber),
        isNotNull(participantProfiles.publishedAt),
        eq(badgeAttempts.status, "completed"),
      ),
    )
    .orderBy(desc(badgeAttempts.completedAt))
    .limit(1);
  return participant ?? null;
}

export async function listPublishedParticipants(): Promise<
  PublishedParticipantCard[]
> {
  if (!process.env.DATABASE_URL) return [];

  const participants = await db
    .select({
      participantNumber: participantProfiles.participantNumber,
      displayName: participantProfiles.displayName,
      updatedAt: participantProfiles.updatedAt,
    })
    .from(participantProfiles)
    .where(
      and(
        isNotNull(participantProfiles.publishedAt),
        sql`exists (
          select 1
          from ${badgeAttempts}
          where ${badgeAttempts.participantId} = ${participantProfiles.participantId}
            and ${badgeAttempts.status} = 'completed'
        )`,
      ),
    )
    .orderBy(asc(participantProfiles.participantNumber));

  return participants.map((participant) => ({
    ...participant,
    updatedAt: participant.updatedAt.toISOString(),
  }));
}
