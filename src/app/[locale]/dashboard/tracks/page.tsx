import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { TRACKS, trackIndex } from "@/lib/dashboard/content";
import {
  countTeamsByTrack,
  findParticipantByUserId,
  findTeamForParticipant,
} from "@/lib/dashboard/state";
import { resolveNow, statusOf } from "@/lib/dashboard/time";

import {
  Cell,
  PageHeader,
  Panel,
  PanelHead,
  Pixel,
  Row,
  Table,
  Tag,
} from "@/components/dashboard/kit";
import { type TrackCard, TrackDeck } from "@/components/dashboard/track-deck";

type TrackMessage = {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  ideas: string[];
  why: string;
};

type WinnerMessage = {
  place: string;
  rewards: { partner: string; credits: string; value?: string }[];
};

export default async function TracksPage({
  params,
}: PageProps<"/[locale]/dashboard/tracks">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const tTracks = await getTranslations("tracks");
  const tPrizes = await getTranslations("prizes");

  const session = await auth.api.getSession({ headers: await headers() });
  const participant = session
    ? await findParticipantByUserId(session.user.id)
    : null;
  if (!participant) return null;

  const [team, counts] = await Promise.all([
    findTeamForParticipant(participant.id),
    countTeamsByTrack(),
  ]);

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
    };
  });

  const { now } = resolveNow();
  // La ventana de selección cierra cuando termina el kickoff (09:00–09:30).
  const windowClosed = statusOf("09:00", "09:30", now) === "past";
  const confirmed = Boolean(team?.trackConfirmedAt);

  const perks = tPrizes.raw("perks") as string[];
  const winners = tPrizes.raw("winners") as WinnerMessage[];

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

      <Panel className="mt-5">
        <PanelHead
          n={50}
          label={t("tracks.prizesLabel")}
          title={tPrizes("amount")}
          aside={<Tag>{tPrizes("amountSub")}</Tag>}
        />
        <Table className="grid sm:grid-cols-3">
          {winners.map((winner) => (
            <Cell key={winner.place} label={winner.place}>
              <ul className="space-y-2">
                {winner.rewards.map((reward) => (
                  <li
                    key={`${winner.place}-${reward.partner}-${reward.credits}`}
                    className="font-mono text-[12px] text-[var(--text-dim)]"
                  >
                    <span className="text-[var(--bright)]">
                      {reward.partner}
                    </span>{" "}
                    · {reward.credits}
                    {reward.value && (
                      <span className="block text-[11px]">{reward.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Cell>
          ))}
        </Table>
        <div className="border-t border-[var(--line)] px-4 py-3.5">
          <p className="font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
            {tPrizes("note")}
          </p>
        </div>
      </Panel>

      <Panel className="mt-5">
        <PanelHead
          n={60}
          label={t("tracks.perksLabel")}
          title={t("tracks.perksTitle")}
        />
        <ul>
          {perks.map((perk) => (
            <Row key={perk} marker="→">
              {perk}
            </Row>
          ))}
        </ul>
      </Panel>

      <Pixel size="sm" className="sr-only">
        {tTracks("headline")}
      </Pixel>
    </>
  );
}
