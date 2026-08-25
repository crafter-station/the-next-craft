import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { TERMS_VERSION } from "@/lib/badge/constants";
import { renderBadgeImage } from "@/lib/badge/image";
import { lookupApprovedGuest } from "@/lib/badge/luma";
import { participantProfilePath } from "@/lib/badge/profile";
import { db } from "@/lib/db";
import {
  badgeAttempts,
  badgeParticipants,
  participantProfiles,
} from "@/lib/db/schema";

const linkSchema = z.object({
  label: z.string().trim().min(1).max(30),
  url: z
    .string()
    .trim()
    .max(2048)
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }),
});

const publicProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(32),
  bio: z.string().trim().max(280),
  links: z.array(linkSchema).max(5),
});

const vehiclePlateSchema = z
  .string()
  .trim()
  .max(20)
  .transform((value) => value.toUpperCase());

const createProfileSchema = publicProfileSchema.extend({
  fullName: z.string().trim().min(2).max(80),
  vehiclePlate: vehiclePlateSchema,
  documentType: z.enum(["dni", "passport", "ce"]),
  documentNumber: z.string().trim().min(5).max(40),
  acceptsTerms: z.literal(true),
});

const updateProfileSchema = publicProfileSchema.extend({
  fullName: z.string().trim().min(2).max(80),
  vehiclePlate: vehiclePlateSchema,
  documentNumber: z.string().trim().min(5).max(40),
});

async function renderExistingBadge(input: {
  participantId: string;
  participantNumber: number;
  displayName: string;
}) {
  const [attempt] = await db
    .select({
      id: badgeAttempts.id,
      pixelArtImageBase64: badgeAttempts.pixelArtImageBase64,
    })
    .from(badgeAttempts)
    .where(
      and(
        eq(badgeAttempts.participantId, input.participantId),
        eq(badgeAttempts.status, "completed"),
      ),
    )
    .orderBy(desc(badgeAttempts.completedAt))
    .limit(1);

  if (!attempt?.pixelArtImageBase64) return null;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenextcraft.org";
  const badge = await renderBadgeImage({
    displayName: input.displayName,
    participantNumber: input.participantNumber,
    portrait: Buffer.from(attempt.pixelArtImageBase64, "base64"),
    shareUrl: `${baseUrl}${participantProfilePath(input.participantNumber)}`,
  });

  return { attemptId: attempt.id, badgeImageBase64: badge.toString("base64") };
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createProfileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid participant details" },
      { status: 400 },
    );
  }

  const guest = await lookupApprovedGuest(session.user.email);
  if (!guest)
    return Response.json(
      { error: "Registration is not approved" },
      { status: 403 },
    );

  const now = new Date();
  const [participant] = await db
    .insert(badgeParticipants)
    .values({
      userId: session.user.id,
      email: guest.email,
      lumaGuestId: guest.id,
      fullName: parsed.data.fullName,
      vehiclePlate: parsed.data.vehiclePlate || null,
      documentType: parsed.data.documentType,
      documentNumber: parsed.data.documentNumber,
      encryptedDocument: null,
      termsVersion: TERMS_VERSION,
      termsAcceptedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: badgeParticipants.userId,
      set: {
        email: guest.email,
        lumaGuestId: guest.id,
        fullName: parsed.data.fullName,
        vehiclePlate: parsed.data.vehiclePlate || null,
        documentType: parsed.data.documentType,
        documentNumber: parsed.data.documentNumber,
        encryptedDocument: null,
        termsVersion: TERMS_VERSION,
        termsAcceptedAt: now,
        updatedAt: now,
      },
    })
    .returning({ id: badgeParticipants.id });

  const [profile] = await db
    .insert(participantProfiles)
    .values({
      participantId: participant.id,
      displayName: parsed.data.displayName,
      bio: parsed.data.bio || null,
      links: parsed.data.links,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: participantProfiles.participantId,
      set: {
        displayName: parsed.data.displayName,
        bio: parsed.data.bio || null,
        links: parsed.data.links,
        updatedAt: now,
      },
    })
    .returning({ participantNumber: participantProfiles.participantNumber });

  const existingBadge = await renderExistingBadge({
    participantId: participant.id,
    participantNumber: profile.participantNumber,
    displayName: parsed.data.displayName,
  });
  if (existingBadge) {
    await db.batch([
      db
        .update(badgeAttempts)
        .set({
          badgeImageBase64: existingBadge.badgeImageBase64,
          updatedAt: now,
        })
        .where(eq(badgeAttempts.id, existingBadge.attemptId)),
      db
        .update(participantProfiles)
        .set({ publishedAt: now, updatedAt: now })
        .where(eq(participantProfiles.participantId, participant.id)),
    ]);
  }

  return Response.json({ ok: true });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = updateProfileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid profile" }, { status: 400 });
  }

  const [record] = await db
    .select({
      participantId: badgeParticipants.id,
      participantNumber: participantProfiles.participantNumber,
      displayName: participantProfiles.displayName,
    })
    .from(badgeParticipants)
    .innerJoin(
      participantProfiles,
      eq(participantProfiles.participantId, badgeParticipants.id),
    )
    .where(eq(badgeParticipants.userId, session.user.id))
    .limit(1);
  if (!record)
    return Response.json({ error: "Profile not found" }, { status: 404 });

  const now = new Date();
  const existingBadge =
    record.displayName === parsed.data.displayName
      ? null
      : await renderExistingBadge({
          participantId: record.participantId,
          participantNumber: record.participantNumber,
          displayName: parsed.data.displayName,
        });
  const participantUpdate = db
    .update(badgeParticipants)
    .set({
      fullName: parsed.data.fullName,
      vehiclePlate: parsed.data.vehiclePlate || null,
      documentNumber: parsed.data.documentNumber,
      encryptedDocument: null,
      updatedAt: now,
    })
    .where(eq(badgeParticipants.id, record.participantId));
  const profileUpdate = db
    .update(participantProfiles)
    .set({
      displayName: parsed.data.displayName,
      bio: parsed.data.bio || null,
      links: parsed.data.links,
      updatedAt: now,
    })
    .where(eq(participantProfiles.participantId, record.participantId));

  if (existingBadge) {
    await db.batch([
      participantUpdate,
      profileUpdate,
      db
        .update(badgeAttempts)
        .set({
          badgeImageBase64: existingBadge.badgeImageBase64,
          updatedAt: now,
        })
        .where(eq(badgeAttempts.id, existingBadge.attemptId)),
    ]);
  } else {
    await db.batch([participantUpdate, profileUpdate]);
  }

  return Response.json({ ok: true });
}
