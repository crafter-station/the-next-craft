import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { python } from "@trigger.dev/python";
import { logger, metadata, schemaTask } from "@trigger.dev/sdk";
import { generateImage } from "ai";
import { and, eq } from "drizzle-orm";
import sharp from "sharp";
import { z } from "zod";

import { renderBadgeImage } from "@/lib/badge/image";
import { participantProfilePath } from "@/lib/badge/profile";
import { db } from "@/lib/db";
import {
  badgeAttempts,
  badgeParticipants,
  participantProfiles,
} from "@/lib/db/schema";

const PIXEL_ART_PROMPT = `Transform the provided selfie or portrait photo into a retro pixel art portrait while preserving the person's identity, facial structure, expression, hairstyle, accessories, and distinctive features.
If the original photo is tilted, rotated, or not vertically aligned, first correct the orientation so the person appears upright and naturally aligned.
Create a wide bust portrait showing the face, neck, complete shoulders, upper torso, and the visible upper portions of both arms. Keep the face centered, clear, and recognizable. Frame the person far enough back that neither shoulder nor arm is cut off by the left or right edge. Leave a narrow green margin on both sides of the full silhouette. The torso may continue naturally beyond the bottom edge so the portrait is cropped only at the bottom, never at the top or sides. Make the shoulder line span most of the canvas width so the person feels broad rather than thin.
Style:
- Authentic retro pixel art aesthetic
- Use only the badge's warm grayscale palette for the person: medium warm gray (#8C8A82), light warm gray (#C4C2B9), bone (#E6E3D8), and off-white (#F2F0E9)
- Medium warm gray (#8C8A82) must be the darkest tone in the portrait; replace every black or near-black area from the source photo with this gray
- Never use pure black, near-black, dark charcoal, or any tone darker than #8C8A82 on the person
- Create strong contrast with the limited warm gray palette, using lighter tones for depth, shading, and facial detail
- Visible, intentional pixels
- Soft dithering and subtle pixel shading
- Clean silhouette and readable facial details
- Wide, centered bust silhouette with both outer shoulders fully visible
- Slightly nostalgic old video game portrait feel
- Vertical portrait composition, taller than it is wide
- High quality pixel art, not a blurry or low resolution photo
Background:
- Use a completely solid, uniform chroma key green background
- Use pure green with the color value #00FF00
- Keep the background flat, clean, and free of texture, gradients, shadows, dithering, noise, or decorative elements
- Create a crisp, clearly defined edge between the person and the green background
- Do not use green anywhere on the person, clothing, hair, skin, accessories, outlines, shading, or reflections
- Avoid green color spill around the silhouette
- The background must be easy to select and remove with chroma key or background removal software
The final image should feel nostalgic, minimal, and stylized while still clearly looking like the same person from the original photo. The portrait itself must use only the specified warm grayscale badge palette, with #8C8A82 as its darkest color. Green must appear only in the removable background.
Avoid changing the person's identity, age, gender presentation, ethnicity, facial proportions, hairstyle, accessories, or expression. Avoid pure black, near-black, dark charcoal, photorealism, smooth digital painting, anime styling, exaggerated features, distortion, extra people, text, logos, busy backgrounds, transparent areas, and colors outside the specified portrait palette and solid green background.`;

async function removeGreenBackground(image: Uint8Array) {
  const directory = await mkdtemp(join(tmpdir(), "the-next-craft-portrait-"));
  const inputPath = join(directory, "generated.png");
  const outputPath = join(directory, "portrait.png");

  try {
    await writeFile(inputPath, image);
    await python.runScript("./python/remove_green_background.py", [
      inputPath,
      outputPath,
    ]);
    return await readFile(outputPath);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message.slice(0, 2000)
    : "Unknown generation error";
}

export const generateParticipantBadge = schemaTask({
  id: "the-next-craft-generate-participant-badge",
  maxDuration: 1200,
  machine: { preset: "medium-1x" },
  retry: { maxAttempts: 1 },
  schema: z.object({ attemptId: z.uuid() }),
  run: async ({ attemptId }) => {
    const [record] = await db
      .select({ attempt: badgeAttempts, participant: badgeParticipants })
      .from(badgeAttempts)
      .innerJoin(
        badgeParticipants,
        eq(badgeAttempts.participantId, badgeParticipants.id),
      )
      .where(eq(badgeAttempts.id, attemptId))
      .limit(1);

    if (!record) throw new Error("Badge attempt not found");
    if (record.attempt.status === "completed") {
      await db
        .update(participantProfiles)
        .set({ publishedAt: new Date(), updatedAt: new Date() })
        .where(eq(participantProfiles.participantId, record.participant.id));
      return { completed: true };
    }
    if (!record.attempt.sourceImageBase64)
      throw new Error("Badge source image is missing");

    metadata.set("phase", "preparing");
    const [claimed] = await db
      .update(badgeAttempts)
      .set({ status: "generating", error: null, updatedAt: new Date() })
      .where(
        and(
          eq(badgeAttempts.id, attemptId),
          eq(badgeAttempts.status, "queued"),
        ),
      )
      .returning({ id: badgeAttempts.id });
    if (!claimed) throw new Error("Badge attempt is no longer queued");

    try {
      const source = Buffer.from(record.attempt.sourceImageBase64, "base64");
      const aiInput = await sharp(source, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({
          width: 1024,
          height: 1024,
          fit: "cover",
          position: "attention",
        })
        .webp({ quality: 90 })
        .toBuffer();

      logger.info("Generating participant pixel art", {
        attemptId,
        model: "openai/gpt-image-1",
      });
      metadata.set("phase", "pixel-art");
      const { image } = await generateImage({
        model: "openai/gpt-image-1",
        prompt: {
          text: PIXEL_ART_PROMPT,
          images: [aiInput],
        },
        size: "1024x1536",
        abortSignal: AbortSignal.timeout(5 * 60 * 1000),
      });

      metadata.set("phase", "background-removal");
      const pixelArt = await removeGreenBackground(image.uint8Array);
      const [profile] = await db
        .select()
        .from(participantProfiles)
        .where(eq(participantProfiles.participantId, record.participant.id))
        .limit(1);
      if (!profile) throw new Error("Participant public profile is missing");

      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenextcraft.org";
      const shareUrl = `${baseUrl}${participantProfilePath(profile.participantNumber)}`;
      metadata.set("phase", "rendering");
      const badge = await renderBadgeImage({
        displayName: profile.displayName,
        participantNumber: profile.participantNumber,
        portrait: pixelArt,
        shareUrl,
      });
      const now = new Date();

      await db.batch([
        db
          .update(badgeAttempts)
          .set({
            status: "completed",
            sourceImageBase64: null,
            sourceImageType: null,
            pixelArtImageBase64: pixelArt.toString("base64"),
            badgeImageBase64: badge.toString("base64"),
            error: null,
            updatedAt: now,
            completedAt: now,
          })
          .where(
            and(
              eq(badgeAttempts.id, attemptId),
              eq(badgeAttempts.status, "generating"),
            ),
          ),
        db
          .update(participantProfiles)
          .set({ publishedAt: now, updatedAt: now })
          .where(eq(participantProfiles.participantId, record.participant.id)),
      ]);

      metadata.set("phase", "completed");
      return { completed: true };
    } catch (error) {
      const message = errorMessage(error);
      const rejected = /safety|policy|moderation|content filter/i.test(message);
      await db
        .update(badgeAttempts)
        .set({
          status: rejected ? "rejected" : "failed",
          sourceImageBase64: null,
          sourceImageType: null,
          error: message,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(badgeAttempts.id, attemptId),
            eq(badgeAttempts.status, "generating"),
          ),
        );
      metadata.set("phase", rejected ? "rejected" : "failed");
      logger.error("Participant badge generation failed", {
        attemptId,
        error: message,
      });
      if (rejected) return { completed: false, rejected: true };
      throw error;
    }
  },
});
