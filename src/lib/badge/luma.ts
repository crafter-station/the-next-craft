import { z } from "zod";

import { LUMA_EVENT_IDS } from "./constants";

const guestSchema = z.object({
  id: z.string(),
  user_email: z.email(),
  user_name: z.string().nullish(),
  user_first_name: z.string().nullish(),
  user_last_name: z.string().nullish(),
  approval_status: z.string(),
});

const guestListSchema = z.object({
  entries: z.array(guestSchema),
  has_more: z.boolean(),
  next_cursor: z.string().optional(),
});

export type ApprovedLumaGuest = {
  id: string;
  email: string;
  displayName: string | null;
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function lookupApprovedGuestInEvent(
  email: string,
  eventId: string,
  apiKey: string,
): Promise<ApprovedLumaGuest | null> {
  let cursor: string | undefined;

  for (let page = 0; page < 20; page += 1) {
    const url = new URL("https://public-api.luma.com/v1/events/guests/list");
    url.searchParams.set("event_id", eventId);
    url.searchParams.set("approval_status", "approved");
    url.searchParams.set("pagination_limit", "200");
    if (cursor) url.searchParams.set("pagination_cursor", cursor);

    const response = await fetch(url, {
      headers: { "x-luma-api-key": apiKey },
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(
        `Luma guest lookup failed for ${eventId} (${response.status})`,
      );

    const data = guestListSchema.parse(await response.json());
    const guest = data.entries.find(
      (entry) => normalizeEmail(entry.user_email) === email,
    );
    if (guest?.approval_status === "approved") {
      const displayName =
        guest.user_name ??
        ([guest.user_first_name, guest.user_last_name]
          .filter(Boolean)
          .join(" ") ||
          null);
      return { id: guest.id, email, displayName };
    }

    if (!data.has_more || !data.next_cursor) return null;
    cursor = data.next_cursor;
  }

  return null;
}

export async function lookupApprovedGuest(
  email: string,
): Promise<ApprovedLumaGuest | null> {
  const apiKey = process.env.LUMA_API_KEY;
  if (!apiKey) throw new Error("LUMA_API_KEY is required");

  const normalizedEmail = normalizeEmail(email);
  const results = await Promise.allSettled(
    LUMA_EVENT_IDS.map((eventId) =>
      lookupApprovedGuestInEvent(normalizedEmail, eventId, apiKey),
    ),
  );
  const approvedGuest = results.find(
    (result): result is PromiseFulfilledResult<ApprovedLumaGuest> =>
      result.status === "fulfilled" && result.value !== null,
  );
  if (approvedGuest) return approvedGuest.value;

  const failedLookup = results.find(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  if (failedLookup) throw failedLookup.reason;

  return null;
}
