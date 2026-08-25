import "server-only";

import { and, asc, desc, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { badgeAttempts, participantProfiles } from "@/lib/db/schema";

import type { PublishedParticipantCard } from "./profile";

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
