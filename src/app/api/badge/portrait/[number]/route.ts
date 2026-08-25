import { and, desc, eq, isNotNull } from "drizzle-orm";
import sharp from "sharp";

import { parseParticipantNumber } from "@/lib/badge/profile";
import { db } from "@/lib/db";
import { badgeAttempts, participantProfiles } from "@/lib/db/schema";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/badge/portrait/[number]">,
) {
  const { number } = await context.params;
  const participantNumber = parseParticipantNumber(number);
  if (!participantNumber) return new Response("Not found", { status: 404 });

  const [record] = await db
    .select({ image: badgeAttempts.pixelArtImageBase64 })
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
  const image = await sharp(Buffer.from(record.image, "base64"))
    .png()
    .toBuffer();
  return new Response(image, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control":
        "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      "Content-Disposition": `attachment; filename="the-next-craft-portrait-${number}.png"`,
    },
  });
}
