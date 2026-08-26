import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { setRequestLocale } from "next-intl/server";

import {
  findPublishedParticipant,
  formatParticipantNumber,
  parseParticipantNumber,
  participantBadgeImagePath,
  participantProfilePath,
} from "@/lib/badge/profile";
import { cityName } from "@/lib/cities";

import { Link } from "@/i18n/navigation";

const findParticipant = cache(findPublishedParticipant);

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/participant/[number]">): Promise<Metadata> {
  const { locale, number } = await params;
  const participantNumber = parseParticipantNumber(number);
  if (!participantNumber) return {};
  const participant = await findParticipant(participantNumber);
  if (!participant) return {};

  const formattedNumber = formatParticipantNumber(participantNumber);
  const imageUrl = participantBadgeImagePath(
    participantNumber,
    participant.updatedAt,
  );
  const title = `${participant.displayName} · #${formattedNumber}`;
  const description =
    participant.bio ||
    (locale === "en"
      ? "Official participant profile for The Next Craft 2026."
      : "Perfil oficial de participante de The Next Craft 2026.");
  return {
    title,
    description,
    alternates: {
      canonical: participantProfilePath(participantNumber, locale),
      languages: {
        es: participantProfilePath(participantNumber, "es"),
        en: participantProfilePath(participantNumber, "en"),
      },
    },
    openGraph: { title, description, images: [imageUrl] },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ParticipantPage({
  params,
}: PageProps<"/[locale]/participant/[number]">) {
  const { locale, number } = await params;
  setRequestLocale(locale);
  const participantNumber = parseParticipantNumber(number);
  if (!participantNumber) notFound();

  const formattedNumber = formatParticipantNumber(participantNumber);
  if (number !== formattedNumber) {
    redirect(participantProfilePath(participantNumber, locale));
  }

  const participant = await findParticipant(participantNumber);
  if (!participant) notFound();
  const imageUrl = participantBadgeImagePath(
    participantNumber,
    participant.updatedAt,
  );

  return (
    <main
      id="main-content"
      className="relative min-h-screen px-5 py-10 md:py-16"
    >
      <div className="grid-bg" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
        <section className="lg:sticky lg:top-16">
          <Link
            href="/gallery"
            className="nav-link mb-6 inline-flex font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-dim)]"
          >
            {locale === "en" ? "← All badges" : "← Todos los badges"}
          </Link>
          <p className="section-label">
            THE NEXT CRAFT · {locale === "en" ? "PARTICIPANT" : "PARTICIPANTE"}
          </p>
          <p className="mt-5 font-pixel text-5xl text-[var(--text-dim)]">
            #{formattedNumber}
          </p>
          {participant.city ? (
            <p className="mt-4 inline-flex w-fit border border-[var(--bright)] px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--bright)]">
              {cityName(participant.city, locale)}
            </p>
          ) : null}
          <h1 className="mt-4 font-pixel text-3xl uppercase leading-tight md:text-5xl">
            {participant.displayName}
          </h1>
          {participant.bio ? (
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-[var(--text-dim)]">
              {participant.bio}
            </p>
          ) : null}
          {participant.links.length > 0 ? (
            <nav
              aria-label={
                locale === "en"
                  ? "Participant links"
                  : "Enlaces del participante"
              }
              className="mt-8 grid gap-3"
            >
              {participant.links.map((link) => (
                <a
                  key={`${link.label}:${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="keycap-ghost inline-flex min-h-12 items-center justify-between px-4 font-pixel text-xs uppercase"
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true">-&gt;</span>
                </a>
              ))}
            </nav>
          ) : null}
        </section>

        <section>
          {/* biome-ignore lint/performance/noImgElement: dynamic generated badge image. */}
          <img
            src={imageUrl}
            width={1080}
            height={1350}
            alt={
              locale === "en"
                ? `${participant.displayName}'s participant badge`
                : `Badge de participante de ${participant.displayName}`
            }
            className="aspect-[4/5] w-full border border-[var(--line)] bg-[var(--screen-dim)]"
          />
          <a
            href={imageUrl}
            download={`the-next-craft-${formattedNumber}.jpg`}
            className="keycap mt-5 inline-flex min-h-12 w-full items-center justify-center px-6 font-pixel text-sm uppercase"
          >
            {locale === "en" ? "Download badge" : "Descargar badge"}
          </a>
        </section>
      </div>
    </main>
  );
}
