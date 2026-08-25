import type { ParticipantProfileLink } from "@/lib/db/schema";

export type PublicParticipantProfile = {
  participantNumber: number;
  displayName: string;
  bio: string | null;
  links: ParticipantProfileLink[];
  published: boolean;
  updatedAt: string;
};

export function formatParticipantNumber(participantNumber: number) {
  return participantNumber.toString().padStart(3, "0");
}

export function parseParticipantNumber(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const participantNumber = Number(value);
  if (!Number.isSafeInteger(participantNumber) || participantNumber < 1)
    return null;
  return participantNumber;
}

export function participantProfilePath(
  participantNumber: number,
  locale = "es",
) {
  return `/${locale}/participant/${formatParticipantNumber(participantNumber)}`;
}
