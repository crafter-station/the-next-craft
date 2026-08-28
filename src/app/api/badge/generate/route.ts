import { tasks } from "@trigger.dev/sdk";
import { and, desc, eq, isNull, lte, or } from "drizzle-orm";
import sharp from "sharp";

import { auth } from "@/lib/auth";
import {
  GENERATION_RATE_LIMIT_MINUTES,
  MAX_PHOTO_BYTES,
} from "@/lib/badge/constants";
import { lookupApprovedGuest } from "@/lib/badge/luma";
import { expireStaleBadgeAttempts } from "@/lib/badge/state";
import { db } from "@/lib/db";
import {
  badgeAttempts,
  badgeParticipants,
  participantProfiles,
} from "@/lib/db/schema";

import type { generateParticipantBadge } from "@/trigger/generate-participant-badge";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [participant] = await db
    .select()
    .from(badgeParticipants)
    .where(eq(badgeParticipants.userId, session.user.id))
    .limit(1);
  if (!participant)
    return Response.json(
      { error: "Participant details are required" },
      { status: 409 },
    );

  const [profile] = await db
    .select({ participantId: participantProfiles.participantId })
    .from(participantProfiles)
    .where(eq(participantProfiles.participantId, participant.id))
    .limit(1);
  if (!profile)
    return Response.json(
      { error: "Public profile details are required" },
      { status: 409 },
    );

  await expireStaleBadgeAttempts(participant.id);

  const [latest] = await db
    .select({ status: badgeAttempts.status })
    .from(badgeAttempts)
    .where(eq(badgeAttempts.participantId, participant.id))
    .orderBy(desc(badgeAttempts.createdAt))
    .limit(1);
  if (latest?.status === "queued" || latest?.status === "generating") {
    return Response.json(
      { error: "Badge generation already in progress" },
      { status: 409 },
    );
  }

  const guest = await lookupApprovedGuest(session.user.email);
  if (!guest || guest.id !== participant.lumaGuestId) {
    return Response.json(
      { error: "Registration is not approved" },
      { status: 403 },
    );
  }
  if (guest.city === "lima") {
    return Response.json(
      { error: "Badge generation is closed in Lima" },
      { status: 410 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }
  const photo = formData.get("photo");
  if (
    !(photo instanceof File) ||
    !acceptedTypes.has(photo.type) ||
    photo.size > MAX_PHOTO_BYTES
  ) {
    return Response.json(
      { error: "Use a JPG, PNG, or WebP image up to 8 MB" },
      { status: 400 },
    );
  }

  let normalizedPhoto: Buffer;
  try {
    normalizedPhoto = await sharp(Buffer.from(await photo.arrayBuffer()), {
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .resize({
        width: 1400,
        height: 1400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer();
  } catch {
    return Response.json(
      { error: "The uploaded image could not be read" },
      { status: 400 },
    );
  }

  const ignoreRateLimit = process.env.DEV_IGNORE_RATELIMIT === "true";
  if (!ignoreRateLimit) {
    const now = new Date();
    const availableAt = new Date(
      now.getTime() + GENERATION_RATE_LIMIT_MINUTES * 60_000,
    );
    const [claimed] = await db
      .update(badgeParticipants)
      .set({ generationAvailableAt: availableAt, updatedAt: now })
      .where(
        and(
          eq(badgeParticipants.id, participant.id),
          or(
            isNull(badgeParticipants.generationAvailableAt),
            lte(badgeParticipants.generationAvailableAt, now),
          ),
        ),
      )
      .returning({ id: badgeParticipants.id });
    if (!claimed) {
      const [current] = await db
        .select({ retryAt: badgeParticipants.generationAvailableAt })
        .from(badgeParticipants)
        .where(eq(badgeParticipants.id, participant.id))
        .limit(1);
      return Response.json(
        {
          error: "Rate limit exceeded",
          retryAt: current?.retryAt?.toISOString(),
        },
        { status: 429 },
      );
    }
  }

  const releaseClaim = ignoreRateLimit
    ? () => Promise.resolve()
    : () =>
        db
          .update(badgeParticipants)
          .set({ generationAvailableAt: null, updatedAt: new Date() })
          .where(eq(badgeParticipants.id, participant.id));

  let attempt: { id: string };
  try {
    [attempt] = await db
      .insert(badgeAttempts)
      .values({
        participantId: participant.id,
        sourceImageBase64: normalizedPhoto.toString("base64"),
        sourceImageType: "image/webp",
      })
      .returning({ id: badgeAttempts.id });
  } catch (error) {
    await releaseClaim();
    console.error("Could not create badge generation attempt", error);
    return Response.json(
      { error: "Could not start generation" },
      { status: 503 },
    );
  }

  try {
    const handle = await tasks.trigger<typeof generateParticipantBadge>(
      "the-next-craft-generate-participant-badge",
      { attemptId: attempt.id },
      { idempotencyKey: `next-craft-badge:${attempt.id}` },
    );
    await db
      .update(badgeAttempts)
      .set({ generationRunId: handle.id, updatedAt: new Date() })
      .where(eq(badgeAttempts.id, attempt.id));
    return Response.json(
      {
        ok: true,
        status: "generating",
        runId: handle.id,
        publicAccessToken: handle.publicAccessToken,
      },
      { status: 202 },
    );
  } catch (error) {
    await Promise.all([
      db
        .update(badgeAttempts)
        .set({
          status: "failed",
          sourceImageBase64: null,
          sourceImageType: null,
          error: "Could not start generation",
          updatedAt: new Date(),
        })
        .where(eq(badgeAttempts.id, attempt.id)),
      db
        .update(badgeParticipants)
        .set({ generationAvailableAt: null, updatedAt: new Date() })
        .where(eq(badgeParticipants.id, participant.id)),
    ]);
    console.error("Could not trigger badge generation", error);
    return Response.json(
      { error: "Generation service is not configured" },
      { status: 503 },
    );
  }
}
