import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { getBadgeStudioState } from "@/lib/badge/state";
import { buildAgenda, type ScheduleMessage } from "@/lib/dashboard/agenda";
import {
  PARTNERS,
  TOTAL_PARTNER_VALUE_USD,
  TRACKS,
  trackIndex,
} from "@/lib/dashboard/content";
import {
  countTeamsByTrack,
  findParticipantByUserId,
  findTeamForParticipant,
  listRedeemedPartners,
} from "@/lib/dashboard/state";
import {
  countdown,
  eventProgress,
  formatDateTime,
  resolveNow,
  statusOf,
  submissionDeadline,
} from "@/lib/dashboard/time";

import {
  Basic,
  Cell,
  Empty,
  Kv,
  keyClass,
  keyGhostClass,
  PageHeader,
  Panel,
  PanelHead,
  Pixel,
  Row,
  Stat,
  Table,
  Tag,
} from "@/components/dashboard/kit";

import { Link } from "@/i18n/navigation";

const pad = (n: number) => String(n).padStart(2, "0");

export default async function DashboardOverview({
  params,
}: PageProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const tSchedule = await getTranslations("schedule");
  const tTracks = await getTranslations("tracks");

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null; // el layout ya muestra la puerta
  const userId = session.user.id;
  const participant = await findParticipantByUserId(userId);
  if (!participant) return null;

  const [team, redeemed, trackCounts, studio] = await Promise.all([
    findTeamForParticipant(participant.id),
    listRedeemedPartners(participant.id),
    countTeamsByTrack(participant.city),
    getBadgeStudioState(userId),
  ]);
  const hasBadge = studio.stage === "completed";

  // Hora de la sede del participante, no una global: el día de 12 horas de
  // Guatemala empieza y termina una hora después que el de Lima.
  const city = participant.city;
  const { now } = resolveNow(city);
  const left = countdown(submissionDeadline(city), now);
  const pct = Math.round(eventProgress(now, city));

  const agenda = buildAgenda(tSchedule.raw("events") as ScheduleMessage[]);
  const live = agenda.filter(
    (b) => statusOf(b.time, b.end, now, city) === "now",
  );
  const upcoming = agenda
    .filter((b) => statusOf(b.time, b.end, now, city) === "next")
    .slice(0, 4);

  const trackKey = team?.track ?? null;
  const confirmed = Boolean(team?.trackConfirmedAt);
  const trackName = trackKey
    ? (tTracks.raw("items") as { name: string }[])[trackIndex(trackKey)]?.name
    : null;

  const claimed = PARTNERS.filter((p) => redeemed.has(p.key)).reduce(
    (sum, p) => sum + p.valueUsd,
    0,
  );

  const checks = [
    {
      done: Boolean(team),
      label: t("checklist.team"),
      href: "/dashboard/team",
      cta: t("checklist.goTeam"),
    },
    {
      done: hasBadge,
      label: t("checklist.badge"),
      href: "/dashboard/badge",
      cta: t("checklist.goBadge"),
    },
    {
      done: confirmed,
      label: t("checklist.track"),
      href: "/dashboard/tracks",
      cta: t("checklist.goTracks"),
    },
    {
      done: Boolean(team?.repoUrl),
      label: t("checklist.repo"),
      href: "/dashboard/team",
      cta: t("checklist.goTeam"),
    },
    {
      done: Boolean(team?.demoUrl),
      label: t("checklist.demo"),
      href: "/dashboard/team",
      cta: t("checklist.goTeam"),
    },
    {
      done: redeemed.size >= 3,
      label: t("checklist.credits"),
      href: "/dashboard/credits",
      cta: t("checklist.goCredits"),
    },
  ] as const;
  const done = checks.filter((c) => c.done).length;

  const submissionChecks = [
    { ok: Boolean(team?.repoUrl), label: t("overview.checkRepo") },
    { ok: Boolean(team?.demoUrl), label: t("overview.checkDemo") },
    { ok: confirmed, label: t("overview.checkTrack") },
    { ok: Boolean(team?.pitch), label: t("overview.checkPitch") },
  ];
  const submissionValid = submissionChecks.every((c) => c.ok);

  return (
    <>
      <PageHeader
        n={10}
        label={t("overview.label")}
        title={t("overview.greeting", {
          name: participant.fullName.split(" ")[0].toUpperCase(),
        })}
        lede={
          confirmed && trackName
            ? t("overview.ledeConfirmed", { track: trackName })
            : t("overview.ledePending")
        }
        aside={
          <div className="flex flex-wrap gap-1.5">
            <Tag strong={hasBadge}>
              {hasBadge ? t("badge.ready") : t("badge.missing")}
            </Tag>
            <Tag strong={confirmed}>
              {confirmed
                ? t("overview.trackConfirmed")
                : t("overview.trackDraft")}
            </Tag>
          </div>
        }
      />

      <Table className="mb-5 grid grid-cols-2 sm:grid-cols-4">
        <Stat
          value={`${pad(left.hrs)}:${pad(left.min)}`}
          label={t("overview.statFreeze")}
          hint={formatDateTime(submissionDeadline(city), locale, city)}
        />
        <Stat value={`${pct}%`} label={t("overview.statProgress")} />
        <Stat
          value={`${done}/${checks.length}`}
          label={t("overview.statChecklist")}
        />
        <Stat
          value={`$${claimed}`}
          label={t("overview.statCredits")}
          hint={t("overview.creditsHint", { total: TOTAL_PARTNER_VALUE_USD })}
        />
      </Table>

      <div className="grid items-start gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-2" screen>
          <PanelHead
            n={20}
            label={t("overview.nextLabel")}
            title={live[0]?.description ?? t("overview.nextTitle")}
            aside={
              <Link href="/dashboard/agenda" className={keyGhostClass}>
                {t("nav.agenda")} →
              </Link>
            }
          />
          {live.length > 0 && (
            <div className="border-b border-[var(--line)] px-4 py-3.5">
              <Basic n={21}>{t("overview.liveLabel")}</Basic>
              {live.map((b) => (
                <div
                  key={b.time}
                  className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1"
                >
                  <span className="font-mono text-[13px] text-[var(--bright)]">
                    {b.time}–{b.end}
                  </span>
                  <span className="font-mono text-[13px] text-[var(--text)]">
                    {b.description}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-dim)]">
                    {t(`places.${b.place}`)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <ul>
            {upcoming.length === 0 ? (
              <Empty>{t("overview.nothingLeft")}</Empty>
            ) : (
              upcoming.map((b) => (
                <Row key={b.time}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-[var(--text)]">{b.description}</span>
                    <span className="text-[11px]">{b.time}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Tag>{t(`kinds.${b.kind}`)}</Tag>
                    <span className="text-[11px]">
                      {t(`places.${b.place}`)}
                    </span>
                    {b.mandatory && <Tag strong>{t("agenda.mandatory")}</Tag>}
                  </div>
                </Row>
              ))
            )}
          </ul>
        </Panel>

        <Panel>
          <PanelHead
            n={30}
            label={t("overview.teamLabel")}
            title={team?.name ?? t("overview.noTeamTitle")}
          />
          {team ? (
            <>
              {team.pitch && (
                <div className="border-b border-[var(--line)] px-4 py-3.5">
                  <p className="font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
                    {team.pitch}
                  </p>
                </div>
              )}
              <ul>
                {team.members.map((m) => (
                  <Row key={m.participantId}>
                    <span className="text-[var(--text)]">{m.fullName}</span>
                    {m.participantId === participant.id && (
                      <span className="ml-2 text-[11px] text-[var(--bright)]">
                        {t("overview.you")}
                      </span>
                    )}
                    {m.role && (
                      <span className="mt-0.5 block text-[11px]">{m.role}</span>
                    )}
                  </Row>
                ))}
              </ul>
              <div className="border-t border-[var(--line)] px-4 py-3.5">
                <Kv k={t("overview.table")}>{team.tableNumber ?? "—"}</Kv>
                <Kv k={t("overview.size")}>
                  {t("overview.sizeValue", { count: team.members.length })}
                </Kv>
                <Kv k={t("overview.repo")}>
                  {team.repoUrl ? (
                    <a
                      href={team.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--bright)]"
                    >
                      {team.repoUrl.replace("https://github.com/", "")}
                    </a>
                  ) : (
                    t("overview.noRepo")
                  )}
                </Kv>
              </div>
            </>
          ) : (
            <div className="px-4 py-5">
              <p className="font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
                {t("overview.noTeamBody")}
              </p>
              <Link
                href="/dashboard/team"
                className={`${keyClass} mt-4 w-full`}
              >
                {t("nav.team")} →
              </Link>
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-3">
        <Panel>
          <PanelHead
            n={40}
            label={t("overview.submissionLabel")}
            title={
              submissionValid
                ? t("overview.submissionValid")
                : t("overview.submissionInvalid")
            }
            aside={
              <Tag strong={submissionValid}>
                {submissionChecks.filter((c) => c.ok).length}/
                {submissionChecks.length}
              </Tag>
            }
          />
          <ul>
            {submissionChecks.map((c) => (
              <Row key={c.label} marker={c.ok ? "✓" : "✗"}>
                <span className={c.ok ? "" : "text-[var(--text)]"}>
                  {c.label}
                </span>
              </Row>
            ))}
          </ul>
          <div className="border-t border-[var(--line)] px-4 py-3">
            <p className="font-mono text-[11px] leading-relaxed text-[var(--text-dim)]">
              {t("overview.submissionNote")}
            </p>
          </div>
        </Panel>

        <Panel>
          <PanelHead
            n={50}
            label={t("overview.trackLabel")}
            title={trackName ?? t("overview.trackNone")}
            aside={
              <Link href="/dashboard/tracks" className={keyGhostClass}>
                {confirmed
                  ? t("overview.trackView")
                  : t("overview.trackChoose")}{" "}
                →
              </Link>
            }
          />
          {trackKey ? (
            <div className="px-4 py-3.5">
              <div className="mb-3 flex flex-wrap gap-1.5">
                <Tag strong>
                  TRACK {TRACKS[trackIndex(trackKey)]?.id ?? "—"}
                </Tag>
                <Tag strong={confirmed}>
                  {confirmed
                    ? t("overview.trackConfirmed")
                    : t("overview.trackDraft")}
                </Tag>
              </div>
              <Kv k={t("overview.trackTeams")}>
                {t("overview.trackTeamsValue", {
                  count: trackCounts.get(trackKey) ?? 0,
                })}
              </Kv>
            </div>
          ) : (
            <Empty>{t("overview.trackChoose")}</Empty>
          )}
        </Panel>

        <Panel>
          <PanelHead
            n={60}
            label={t("overview.checklistLabel")}
            title={t("overview.checklistTitle", {
              done,
              total: checks.length,
            })}
          />
          <ul>
            {checks.map((c) => (
              <li
                key={c.label}
                className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-2.5 last:border-b-0"
              >
                <span className="w-3 shrink-0 font-mono text-[12px] text-[var(--bright)]">
                  {c.done ? "✓" : "·"}
                </span>
                <span
                  className={
                    c.done
                      ? "flex-1 font-mono text-[12px] text-[var(--text-dim)] line-through decoration-[var(--line)]"
                      : "flex-1 font-mono text-[12px] text-[var(--text)]"
                  }
                >
                  {c.label}
                </span>
                {!c.done && (
                  <Link
                    href={c.href}
                    className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--text-dim)] hover:text-[var(--bright)]"
                  >
                    {c.cta} →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-5">
        <PanelHead
          n={80}
          label={t("overview.hubsLabel")}
          title={t("overview.hubsTitle")}
        />
        <Table className="grid grid-cols-2 sm:grid-cols-5">
          {(
            ["lima", "bogota", "guatemala", "arequipa", "salvador"] as const
          ).map((city) => (
            <Cell key={city}>
              <Pixel size="sm">{city}</Pixel>
              {participant.city === city && (
                <p className="mt-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--bright)]">
                  {t("overview.yourHub")}
                </p>
              )}
            </Cell>
          ))}
        </Table>
      </Panel>
    </>
  );
}
