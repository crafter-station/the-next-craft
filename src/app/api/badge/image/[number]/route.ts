import { and, desc, eq, isNotNull } from "drizzle-orm";

import { parseParticipantNumber } from "@/lib/badge/profile";
import { db } from "@/lib/db";
import { badgeAttempts, participantProfiles } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
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
  return new Response(Buffer.from(record.image, "base64"), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control":
        "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      "Content-Disposition": `inline; filename="the-next-craft-${number}.jpg"`,
    },
  });
}
