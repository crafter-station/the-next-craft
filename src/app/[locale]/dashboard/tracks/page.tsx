import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { trackBalance } from "@/lib/dashboard/capacity";
import { TRACKS, trackIndex } from "@/lib/dashboard/content";
import {
  countTeamsByTrack,
  findParticipantByUserId,
  findTeamForParticipant,
} from "@/lib/dashboard/state";
import { resolveNow, statusOf } from "@/lib/dashboard/time";

import { PageHeader, Panel, Pixel, Tag } from "@/components/dashboard/kit";
import { type TrackCard, TrackDeck } from "@/components/dashboard/track-deck";

type TrackMessage = {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  ideas: string[];
  why: string;
};

export default async function TracksPage({
  params,
}: PageProps<"/[locale]/dashboard/tracks">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const tTracks = await getTranslations("tracks");

  const session = await auth.api.getSession({ headers: await headers() });
  const participant = session
    ? await findParticipantByUserId(session.user.id)
    : null;
  if (!participant) return null;

  // El cupo es por sede: el contador y el tope que ve este hacker son los de
  // su sede, no los del evento entero.
  const [team, counts] = await Promise.all([
    findTeamForParticipant(participant.id),
    countTeamsByTrack(participant.city),
  ]);
  // El techo no es un número fijo: sale del reparto equitativo de los equipos
  // que ya confirmaron en esta sede, así que sube solo según entra gente.
  const balance = trackBalance(counts);

  const items = tTracks.raw("items") as TrackMessage[];
  const cards: TrackCard[] = TRACKS.map((track) => {
    const message = items[trackIndex(track.key)];
    return {
      key: track.key,
      id: track.id,
      name: message.name,
      tagline: message.tagline,
      desc: message.desc,
      ideas: message.ideas,
      why: message.why,
      teams: counts.get(track.key) ?? 0,
      limit: participant.city ? (balance.get(track.key)?.limit ?? null) : null,
    };
  });

  const { now } = resolveNow(participant.city);
  // La ventana de selección cierra cuando termina el kickoff (09:00–09:30),
  // en hora de la sede: en Guatemala esas 09:30 caen una hora después que en
  // Lima, y con un offset global el track les aparecía cerrado al llegar.
  const windowClosed =
    statusOf("09:00", "09:30", now, participant.city) === "past";
  const confirmed = Boolean(team?.trackConfirmedAt);

  return (
    <>
      <PageHeader
        n={30}
        label={t("tracks.label")}
        title={t("tracks.headline")}
        lede={tTracks("intro")}
        aside={
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Tag strong={confirmed}>
              {confirmed ? t("tracks.barConfirmed") : t("tracks.barDraft")}
            </Tag>
            <span className="font-mono text-[11px] text-[var(--text-dim)]">
              {t("tracks.closesAt", { time: "09:30" })}
            </span>
          </div>
        }
      />

      {windowClosed && !confirmed && (
        <Panel className="mb-5">
          <div className="px-4 py-3.5">
            <p className="font-mono text-[11px] leading-none tracking-[0.14em] uppercase text-[var(--text-dim)]">
              <span className="text-[var(--bright)]">31 </span>PRINT &quot;
              {t("tracks.windowClosedLabel")}&quot;
            </p>
            <p className="mt-2.5 font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
              {t("tracks.windowClosedBody")}
            </p>
          </div>
        </Panel>
      )}

      <TrackDeck
        tracks={cards}
        selected={team?.track ?? null}
        confirmed={confirmed}
        ideasLabel={tTracks("ideasLabel")}
      />

      <Pixel size="sm" className="sr-only">
        {tTracks("headline")}
      </Pixel>
    </>
  );
}
