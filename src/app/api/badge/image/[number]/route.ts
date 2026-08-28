import { and, desc, eq, isNotNull } from "drizzle-orm";
import sharp from "sharp";

import { parseParticipantNumber } from "@/lib/badge/profile";
import { db } from "@/lib/db";
import { badgeAttempts, participantProfiles } from "@/lib/db/schema";

const THUMBNAIL_WIDTHS = new Set([360, 540, 720]);

function parseWidth(value: string | null) {
  if (!value) return null;
  const width = Number(value);
  if (!THUMBNAIL_WIDTHS.has(width)) return null;
  return width;
}

export async function GET(
  request: Request,
  context: RouteContext<"/api/badge/image/[number]">,
) {
  const { number } = await context.params;
  const participantNumber = parseParticipantNumber(number);
  if (!participantNumber) return new Response("Not found", { status: 404 });

  const [record] = await db
    .select({ image: badgeAttempts.badgeImageBase64 })
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

  if (!record?.image) return new Response("Not found", { status: 404 });

  const width = parseWidth(new URL(request.url).searchParams.get("w"));
  const image = width
    ? await sharp(Buffer.from(record.image, "base64"))
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer()
    : Buffer.from(record.image, "base64");

  return new Response(image, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control":
        "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      "Content-Disposition": `inline; filename="the-next-craft-${number}.jpg"`,
    },
  });
}
