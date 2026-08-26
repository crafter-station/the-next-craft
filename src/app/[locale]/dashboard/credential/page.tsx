import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { participantProfilePath } from "@/lib/badge/profile";
import { qrDataUri } from "@/lib/badge/qr";
import { buildAgenda, type ScheduleMessage } from "@/lib/dashboard/agenda";
import { PARTNERS, TRACKS, trackIndex } from "@/lib/dashboard/content";
import {
  findParticipantByUserId,
  findTeamForParticipant,
  getQrTarget,
} from "@/lib/dashboard/state";
import { resolveNow, statusOf } from "@/lib/dashboard/time";

import { BadgeCard } from "@/components/dashboard/badge-card";
import {
  Kv,
  PageHeader,
  Panel,
  PanelHead,
  Row,
  Tag,
} from "@/components/dashboard/kit";
import { QrTargetForm } from "@/components/dashboard/qr-target-form";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenextcraft.org";

export default async function CredentialPage({
  params,
}: PageProps<"/[locale]/dashboard/credential">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const tSchedule = await getTranslations("schedule");

  const session = await auth.api.getSession({ headers: await headers() });
  const participant = session
    ? await findParticipantByUserId(session.user.id)
    : null;
  if (!participant) return null;

  const [team, qrTarget] = await Promise.all([
    findTeamForParticipant(participant.id),
    getQrTarget(participant.id),
  ]);

  const profileUrl = participant.participantNumber
    ? `${SITE_URL}${participantProfilePath(participant.participantNumber, locale)}`
    : null;

  // El QR impreso siempre apunta al redireccionador; el destino final es lo
  // único que cambia, así el cartón nunca queda obsoleto.
  const redirectUrl = `${SITE_URL}/r/${participant.shareToken}`;
  const finalTarget =
    qrTarget.mode === "profile" && profileUrl
      ? profileUrl
      : qrTarget.mode === "custom" && qrTarget.customUrl
        ? qrTarget.customUrl
        : SITE_URL;

  const qr = await qrDataUri(redirectUrl);

  const { now } = resolveNow();
  const meals = buildAgenda(tSchedule.raw("events") as ScheduleMessage[])
    .filter((b) => b.kind === "meal")
    .map((b) => ({ ...b, used: statusOf(b.time, b.end, now) === "past" }));

  const trackId = team?.track ? TRACKS[trackIndex(team.track)]?.id : null;

  return (
    <>
      <PageHeader
        n={20}
        label={t("credential.label")}
        title={t("credential.headline")}
        lede={t("credential.lede")}
        aside={<Tag strong>{t("credential.accredited")}</Tag>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div>
          <BadgeCard
            qrDataUri={qr}
            name={participant.fullName}
            code={participant.shareToken.slice(0, 8).toUpperCase()}
            hub={(participant.city ?? "").toUpperCase()}
            dates="29 AGO 2026"
            team={team?.name ?? null}
            table={team?.tableNumber ?? null}
            track={trackId ? `TRACK ${trackId}` : null}
            partners={PARTNERS.map((p) => p.name)}
            scanLabel={t("credential.scanMode")}
            scanHint={t("credential.scanHint")}
            closeLabel={t("credential.scanClose")}
            labels={{
              team: t("credential.team"),
              table: t("credential.table"),
              track: t("credential.track"),
            }}
          />
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-[var(--text-dim)]">
            {t("credential.warning")}
          </p>
        </div>

        <div className="grid gap-5">
          <Panel screen>
            <PanelHead
              n={21}
              label={t("credential.qrLabel")}
              title={t("credential.qrTitle")}
              aside={
                <Tag strong={qrTarget.mode !== "site"}>{qrTarget.mode}</Tag>
              }
            />
            <div className="border-b border-[var(--line)] px-4 py-3.5">
              <p className="font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
                {t("credential.qrBody")}
              </p>
              <p
                className="mt-3 truncate font-mono text-[11px] text-[var(--bright)]"
                title={finalTarget}
              >
                → {finalTarget}
              </p>
            </div>
            <QrTargetForm
              mode={qrTarget.mode}
              customUrl={qrTarget.customUrl}
              profileUrl={profileUrl}
            />
          </Panel>

          <Panel>
            <PanelHead
              n={22}
              label={t("credential.statusLabel")}
              title={t("credential.statusIn")}
            />
            <div className="px-4 py-3.5">
              <Kv k={t("credential.code")}>
                {participant.shareToken.slice(0, 8).toUpperCase()}
              </Kv>
              <Kv k={t("credential.email")}>{participant.email}</Kv>
              <Kv k={t("credential.hub")}>{participant.city ?? "—"}</Kv>
            </div>
          </Panel>

          <Panel>
            <PanelHead
              n={23}
              label={t("credential.includedLabel")}
              title={t("credential.includedTitle", {
                count: meals.filter((m) => !m.used).length,
              })}
            />
            <ul>
              {meals.map((m) => (
                <Row key={m.time} marker={m.used ? "✓" : "→"}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span
                      className={
                        m.used
                          ? "line-through decoration-[var(--line)]"
                          : "text-[var(--text)]"
                      }
                    >
                      {m.description}
                    </span>
                    <span className="text-[11px]">
                      {m.time}–{m.end}
                    </span>
                  </div>
                </Row>
              ))}
              <Row marker="→">{t("credential.includedSwag")}</Row>
              <Row marker="→">{t("credential.includedCommunity")}</Row>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
