import { and, desc, eq, inArray, lte } from "drizzle-orm";

import type { PublicParticipantProfile } from "@/lib/badge/profile";
import { db } from "@/lib/db";
import {
  badgeAttempts,
  badgeParticipants,
  participantProfiles,
} from "@/lib/db/schema";

type ParticipantState = {
  fullName: string;
  profile: PublicParticipantProfile;
};

export type BadgeStudioState =
  | { stage: "details"; fullName: string | null }
  | (ParticipantState & {
      stage: "upload";
      retryAt: string | null;
      error?: "failed" | "rejected";
    })
  | (ParticipantState & {
      stage: "generating";
      runId: string | null;
      publicAccessToken: string | null;
      hasCurrentBadge: boolean;
    })
  | (ParticipantState & {
      stage: "completed";
      retryAt: string | null;
      replacementError?: "failed" | "rejected";
    });

const staleAttemptCutoff = () => new Date(Date.now() - 30 * 60_000);

export async function expireStaleBadgeAttempts(participantId: string) {
  await db
    .update(badgeAttempts)
    .set({
      status: "failed",
      sourceImageBase64: null,
      sourceImageType: null,
      error: "Generation timed out",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(badgeAttempts.participantId, participantId),
        inArray(badgeAttempts.status, ["queued", "generating"]),
        lte(badgeAttempts.updatedAt, staleAttemptCutoff()),
      ),
    );
}

export async function getBadgeStudioState(
  userId: string,
): Promise<BadgeStudioState> {
  const [participant] = await db
    .select()
    .from(badgeParticipants)
    .where(eq(badgeParticipants.userId, userId))
    .limit(1);
  if (!participant) return { stage: "details", fullName: null };

  const [profile] = await db
    .select()
    .from(participantProfiles)
    .where(eq(participantProfiles.participantId, participant.id))
    .limit(1);
  if (!profile) return { stage: "details", fullName: participant.fullName };

  await expireStaleBadgeAttempts(participant.id);

  const [[latest], [latestCompleted]] = await Promise.all([
    db
      .select()
      .from(badgeAttempts)
      .where(eq(badgeAttempts.participantId, participant.id))
      .orderBy(desc(badgeAttempts.createdAt))
      .limit(1),
    db
      .select({ id: badgeAttempts.id })
      .from(badgeAttempts)
      .where(
        and(
          eq(badgeAttempts.participantId, participant.id),
          eq(badgeAttempts.status, "completed"),
        ),
      )
      .orderBy(desc(badgeAttempts.completedAt))
      .limit(1),
  ]);

  const participantState: ParticipantState = {
    fullName: participant.fullName,
    profile: {
      participantNumber: profile.participantNumber,
      displayName: profile.displayName,
      bio: profile.bio,
      links: profile.links,
      published: Boolean(profile.publishedAt),
      updatedAt: profile.updatedAt.toISOString(),
    },
  };
  const retryAt = participant.generationAvailableAt?.toISOString() ?? null;

  if (!latest) return { ...participantState, stage: "upload", retryAt };

  if (latest.status === "queued" || latest.status === "generating") {
    return {
      ...participantState,
      stage: "generating",
      runId: latest.generationRunId,
      publicAccessToken: null,
      hasCurrentBadge: Boolean(latestCompleted),
    };
  }

  if (latest.status === "completed" || latestCompleted) {
    return {
      ...participantState,
      stage: "completed",
      retryAt,
      replacementError:
        latest.status === "failed" || latest.status === "rejected"
          ? latest.status
          : undefined,
    };
  }

  return {
    ...participantState,
    stage: "upload",
    retryAt,
    error: latest.status === "rejected" ? "rejected" : "failed",
  };
}
