import { config } from "dotenv";
import { and, eq, isNull } from "drizzle-orm";

config({ path: ".env.local", quiet: true });

const [
  { listApprovedLumaGuests, normalizeEmail },
  { db },
  { badgeParticipants },
] = await Promise.all([
  import("@/lib/badge/luma"),
  import("@/lib/db"),
  import("@/lib/db/schema"),
]);

const participants = await db
  .select({
    id: badgeParticipants.id,
    email: badgeParticipants.email,
    lumaGuestId: badgeParticipants.lumaGuestId,
  })
  .from(badgeParticipants)
  .where(isNull(badgeParticipants.city));
const guests = await listApprovedLumaGuests();
const guestsById = new Map(guests.map((guest) => [guest.id, guest]));
const guestsByEmail = new Map(guests.map((guest) => [guest.email, guest]));

let updated = 0;
let unmatched = 0;
for (const participant of participants) {
  const guest =
    guestsById.get(participant.lumaGuestId) ??
    guestsByEmail.get(normalizeEmail(participant.email));
  if (!guest) {
    unmatched += 1;
    continue;
  }

  const rows = await db
    .update(badgeParticipants)
    .set({ city: guest.city, updatedAt: new Date() })
    .where(
      and(
        eq(badgeParticipants.id, participant.id),
        isNull(badgeParticipants.city),
      ),
    )
    .returning({ id: badgeParticipants.id });
  updated += rows.length;
}

console.log(`Updated ${updated} of ${participants.length} participants.`);
if (unmatched > 0) {
  console.warn(`${unmatched} participants had no approved Luma registration.`);
}
