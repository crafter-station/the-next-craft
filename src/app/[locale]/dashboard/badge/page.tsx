import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import {
  participantBadgeImagePath,
  participantProfilePath,
} from "@/lib/badge/profile";
import { getBadgeStudioState } from "@/lib/badge/state";
import { buildAgenda, type ScheduleMessage } from "@/lib/dashboard/agenda";
import { findParticipantByUserId } from "@/lib/dashboard/state";

import {
  Empty,
  Kv,
  keyClass,
  keyGhostClass,
  PageHeader,
  Panel,
  PanelHead,
  Row,
  Tag,
} from "@/components/dashboard/kit";

import { Link } from "@/i18n/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenextcraft.org";

/**
 * El badge no es un cartón impreso: lo genera el Badge Studio y su QR ya
 * apunta al perfil público. Aquí no se genera nada — se muestra el que existe
 * y se manda al estudio para crearlo o reemplazarlo.
 */
export default async function BadgePage({
  params,
}: PageProps<"/[locale]/dashboard/badge">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const tSchedule = await getTranslations("schedule");

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [participant, studio] = await Promise.all([
    findParticipantByUserId(session.user.id),
    getBadgeStudioState(session.user.id),
  ]);
  if (!participant) return null;

  const ready = studio.stage === "completed";
  const generating = studio.stage === "generating";
  const profile = "profile" in studio ? studio.profile : null;

  const badgeSrc =
    ready && profile
      ? participantBadgeImagePath(
          profile.participantNumber,
          profile.updatedAt,
          720,
        )
      : null;
  const profileUrl = profile
    ? `${SITE_URL}${participantProfilePath(profile.participantNumber, locale)}`
    : null;

  // Las comidas se listan como lo que incluye la entrada. No llevan estado
  // de «usada»: el control en sede es manual y nada lo registra todavía.
  const meals = buildAgenda(
    tSchedule.raw("events") as ScheduleMessage[],
  ).filter((b) => b.kind === "meal");

  return (
    <>
      <PageHeader
        n={20}
        label={t("badge.label")}
        title={t("badge.headline")}
        lede={t("badge.lede")}
        aside={
          <Tag strong={ready}>
            {ready
              ? t("badge.ready")
              : generating
                ? t("badge.generating")
                : t("badge.missing")}
          </Tag>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div>
          <Panel screen className="p-3">
            {badgeSrc ? (
              // biome-ignore lint/performance/noImgElement: PNG servido por /api/badge/image
              <img
                src={badgeSrc}
                alt={t("badge.imageAlt")}
                className="h-auto w-full"
              />
            ) : (
              <Empty>
                {generating
                  ? t("badge.generatingBody")
                  : t("badge.missingBody")}
              </Empty>
            )}
          </Panel>

          <Link
            href="/badge"
            className={`${ready ? keyGhostClass : keyClass} mt-3 w-full`}
          >
            {ready ? t("badge.replace") : t("badge.create")} →
          </Link>

          <p className="mt-3 font-mono text-[10px] leading-relaxed text-[var(--text-dim)]">
            {t("badge.note")}
          </p>
        </div>

        <div className="grid gap-5">
          <Panel>
            <PanelHead
              n={21}
              label={t("badge.qrLabel")}
              title={t("badge.qrTitle")}
            />
            <div className="px-4 py-3.5">
              <p className="font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
                {t("badge.qrBody")}
              </p>
              {profileUrl ? (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block truncate font-mono text-[11px] text-[var(--bright)] underline decoration-[var(--line)] underline-offset-4"
                >
                  → {profileUrl}
                </a>
              ) : (
                <p className="mt-3 font-mono text-[11px] text-[var(--text-dim)]">
                  {t("badge.qrMissing")}
                </p>
              )}
            </div>
            {profile && (
              <div className="border-t border-[var(--line)] px-4 py-3.5">
                <Kv k={t("badge.number")}>
                  #{String(profile.participantNumber).padStart(3, "0")}
                </Kv>
                <Kv k={t("badge.displayName")}>{profile.displayName}</Kv>
                <Kv k={t("badge.published")}>
                  {profile.published ? t("badge.public") : t("badge.private")}
                </Kv>
              </div>
            )}
          </Panel>

          <Panel>
            <PanelHead
              n={22}
              label={t("badge.identityLabel")}
              title={t("badge.identityTitle")}
            />
            <div className="px-4 py-3.5">
              <Kv k={t("badge.fullName")}>{participant.fullName}</Kv>
              <Kv k={t("badge.email")}>{participant.email}</Kv>
              <Kv k={t("badge.hub")}>{participant.city ?? "—"}</Kv>
            </div>
          </Panel>

          <Panel>
            <PanelHead
              n={23}
              label={t("badge.includedLabel")}
              title={t("badge.includedTitle", { count: meals.length })}
            />
            <ul>
              {meals.map((m) => (
                <Row key={m.time} marker="→">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-[var(--text)]">{m.description}</span>
                    <span className="text-[11px]">
                      {m.time}–{m.end}
                    </span>
                  </div>
                </Row>
              ))}
              <Row marker="→">{t("badge.includedSwag")}</Row>
              <Row marker="→">{t("badge.includedCommunity")}</Row>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
