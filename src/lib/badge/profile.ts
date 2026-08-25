import type { ParticipantProfileLink } from "@/lib/db/schema";

export type PublicParticipantProfile = {
  participantNumber: number;
  displayName: string;
  bio: string | null;
  links: ParticipantProfileLink[];
  published: boolean;
  updatedAt: string;
};

export type PublishedParticipantCard = {
  participantNumber: number;
  displayName: string;
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

export function galleryPath(locale = "es") {
  return `/${locale}/gallery`;
}

export function participantBadgeImagePath(
  participantNumber: number,
  updatedAt: Date | string,
  width?: number,
) {
  const formattedNumber = formatParticipantNumber(participantNumber);
  const version =
    updatedAt instanceof Date ? updatedAt.getTime() : Date.parse(updatedAt);
  const params = new URLSearchParams({ v: String(version) });
  if (width) params.set("w", String(width));
  return `/api/badge/image/${formattedNumber}?${params.toString()}`;
}
