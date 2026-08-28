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

/**
 * gpt-image-2 resuelve el vello facial y la sonrisa, que gpt-image-1 fallaba
 * por mucho que se lo pidiera el prompt, y ademas sale unas doce veces mas
 * barato: ~$0.02 por badge contra ~$0.26.
 *
 * La calidad va explicita a proposito. Cada modelo trae un default distinto
 * (gpt-image-1 usa "high", gpt-image-2 usa "low") y dejarlo implicito hace que
 * el costo dependa de esa eleccion; "low" es la calidad con la que validamos
 * el resultado.
 */
export const BADGE_IMAGE_MODEL = "openai/gpt-image-2";
export const BADGE_IMAGE_QUALITY = "low";

export const PIXEL_ART_PROMPT = `Transform the provided selfie or portrait photo into a retro pixel art portrait while preserving the person's identity, hairstyle, accessories, and distinctive features. This is a clean, simplified drawing of the person, not a pixel-by-pixel copy of the photograph: keep the likeness in the silhouette, the hair, the shape of the brows and eyes, and the accessories, and simplify everything else.
If the original photo is tilted, rotated, or not vertically aligned, first correct the orientation so the person appears upright and naturally aligned.
Create a wide bust portrait showing the face, neck, complete shoulders, upper torso, and the visible upper portions of both arms. Keep the face centered, clear, and recognizable. Frame the person far enough back that neither shoulder nor arm is cut off by the left or right edge. Leave a narrow green margin on both sides of the full silhouette. The torso may continue naturally beyond the bottom edge so the portrait is cropped only at the bottom, never at the top or sides. Make the shoulder line span most of the canvas width so the person feels broad rather than thin.
Face:
The eyes, eyebrows, nose, and mouth carry the whole portrait. Draw them as deliberate, clean pixel shapes rather than as dithered texture, and let the warmth of the portrait come from them.
- Give the person a soft, warm, quietly happy expression: relaxed brow, full rounded cheeks, a soft rounded chin, and a gently rounded jawline. Keep their real bone structure and likeness, but let the face read round and soft rather than long, narrow, or angular
- Model the face with rounded volume: use the light warm gray (#C4C2B9) for gentle shading along the cheeks, under the cheekbones, along the jaw, at the temples, and under the chin, so the face looks soft and three-dimensional. The face must never be a flat pale shape with dark features stamped onto it
- Eyes: two matching, softly rounded shapes, level with each other and evenly spaced, each with a gently defined iris and a single lighter highlight pixel so the gaze reads warm and friendly. Keep the eye outline thin and light — no heavy eyeliner, no thick block of lashes, no hard dark rim enclosing the eye. Never blank dark slots, smudged blocks, or uneven pairs
- Leave at least one lighter pixel of skin between each eye and the eyebrow above it so they never merge into a single dark mass
- Eyebrows: two thin, matching, softly curved strokes kept light in tone, level with each other and clearly separated from the hairline. Never heavy dark blocks, never fused into the hair
- Nose: small and understated, suggested with a few pixels of soft light shading at the tip and one gentle shadow to one side. No nostril blobs, no hooked or angular dark shape, and no hard dark mass in the middle of the face
- Mouth: a small, clearly curved, closed-mouth smile centred under the nose, with the corners sitting a pixel higher than the middle so it reads unmistakably as a gentle smile. Keep it light and clean, with no dark line or shadow smudged underneath it. Never a thick flat dark bar, never a smear, and never a smirk
- Do not draw expression lines or skin detail of any kind: no nasolabial folds, no smile or laugh lines, no crease under the lower lip or on the chin, no shadows or bags under the eyes, no forehead or neck lines, no wrinkles, no pores, no blemishes, and no dark outline around the lips. Every one of these turns into a harsh dark streak once pixelated and makes the person look severe or older than they are
- Leave the skin as clean, smooth, unbroken areas of tone, shaped only by the soft rounded shading described above
- Keep the eyes, nose, and mouth completely free of dithering and speckle so they stay crisp; hair, clothing, and the larger forms are where texture belongs
- Keep both sides of the face symmetric and evenly placed unless the photo shows a deliberate asymmetry such as a side part
- Draw glasses, piercings, and headwear faithfully and as clean readable shapes: a glasses frame stays thin and even, sits level, and never swallows or darkens the eyes behind it
If the person has any facial hair, draw it so that the mouth always survives:
- Draw the smile first and keep it fully visible and unbroken. Facial hair may never cover, cross, interrupt, or stand in for the mouth
- A moustache sits entirely above the mouth, with at least one pixel of lighter skin between the bottom of the moustache and the top of the smile so the two never touch or merge into one shape
- Render beards, moustaches, stubble, and soul patches as soft, even, light shading that follows the jaw, using a mid tone and never the darkest tone. Never a thick solid dark bar, block, or smear
- A beard keeps a clean readable edge and stays clearly separate from the mouth, the lower lip, and the shadow of the neck
Style:
- Authentic retro pixel art aesthetic
- Use only the badge's warm grayscale palette for the person: medium warm gray (#8C8A82), light warm gray (#C4C2B9), bone (#E6E3D8), and off-white (#F2F0E9)
- Medium warm gray (#8C8A82) must be the darkest tone in the portrait; replace every black or near-black area from the source photo with this gray
- Never use pure black, near-black, dark charcoal, or any tone darker than #8C8A82 on the person
- Spread all four tones across the face itself so the cheeks, forehead, and jaw carry soft rounded shading; keep the darkest tone for hair, clothing, and the eyes instead of stamping it across the features
- Visible, intentional pixels
- Soft dithering and subtle pixel shading in the hair, clothing, and larger forms
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
- Do not use green anywhere on the person, clothing, hair, skin, accessories, outlines, or shading
- Avoid green color spill around the silhouette
- The background must be easy to select and remove with chroma key or background removal software
The final image should feel nostalgic, minimal, and stylized while still clearly looking like the same person from the original photo, with a face that reads as warm and approachable. The portrait itself must use only the specified warm grayscale badge palette, with #8C8A82 as its darkest color. Green must appear only in the removable background.
Avoid changing the person's identity, age, gender presentation, ethnicity, facial proportions, hairstyle, or accessories beyond the gentle softening of expression described above. Avoid pure black, near-black, dark charcoal, photorealism, smooth digital painting, anime styling, chibi or caricature proportions, exaggerated features, distortion, uneven or misaligned eyes, blank dark eye sockets, heavy eyeliner, a thick dark bar for a mouth, dithering over the eyes nose or mouth, long narrow or angular faces, pointed chins, a flat unshaded face, nasolabial folds, smile lines, wrinkles, under-eye shadows, lip outlines, skin texture, any crease or shadow copied literally out of the photograph, a moustache or beard that touches, covers, or replaces the mouth, a hidden or missing mouth, an expressionless face, harsh or severe expressions, intense or piercing stares, extra people, text, logos, busy backgrounds, transparent areas, and colors outside the specified portrait palette and solid green background.`;

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
        // Mismo aspecto que la salida (1024x1536) para que el modelo no tenga
        // que inventarse el alto y estire la cara. Rellenamos en verde en vez
        // de recortar: con `cover` una foto cuadrada perdia un tercio del
        // ancho y se quedaba sin hombros, y el relleno ya es el croma que pide
        // el prompt.
        .resize({
          width: 1024,
          height: 1536,
          fit: "contain",
          background: { r: 0, g: 255, b: 0, alpha: 1 },
        })
        .webp({ quality: 90 })
        .toBuffer();

      logger.info("Generating participant pixel art", {
        attemptId,
        model: BADGE_IMAGE_MODEL,
        quality: BADGE_IMAGE_QUALITY,
      });
      metadata.set("phase", "pixel-art");
      const { image } = await generateImage({
        model: BADGE_IMAGE_MODEL,
        prompt: {
          text: PIXEL_ART_PROMPT,
          images: [aiInput],
        },
        size: "1024x1536",
        providerOptions: { openai: { quality: BADGE_IMAGE_QUALITY } },
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
