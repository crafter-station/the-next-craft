import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { badgeStudioPath } from "@/lib/badge/intent";
import {
  formatParticipantNumber,
  galleryPath,
  participantBadgeImagePath,
  participantPortraitPath,
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
 * Donde vive el badge una vez hecho. El estudio es el taller —se entra a
 * crearlo o a cambiarlo y se sale— y de hecho redirige aquí a quien llega con
 * uno ya generado, así que esta página tiene que bastarse: verlo, descargarlo,
 * saber a dónde lleva su QR y volver al estudio con una intención concreta.
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

  const formattedNumber = profile
    ? formatParticipantNumber(profile.participantNumber)
    : null;
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
  const portraitSrc =
    ready && profile
      ? participantPortraitPath(profile.participantNumber, profile.updatedAt)
      : null;
  // Sin el `?w=`: la descarga debe ser el badge a resolución completa, no la
  // versión reducida que se pinta arriba.
  const badgeDownloadSrc =
    ready && profile
      ? participantBadgeImagePath(profile.participantNumber, profile.updatedAt)
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

          {/* El badge se genera en el estudio y se consulta aquí, así que
              cada acción que necesite el estudio entra con su intención
              declarada: sin ella el estudio devuelve a esta misma página. */}
          {ready ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <a
                href={badgeDownloadSrc ?? undefined}
                download={`the-next-craft-${formattedNumber}.jpg`}
                className={`${keyClass} w-full`}
              >
                {t("badge.download")}
              </a>
              <a
                href={portraitSrc ?? undefined}
                download={`the-next-craft-portrait-${formattedNumber}.png`}
                className={`${keyGhostClass} w-full`}
              >
                {t("badge.downloadPortrait")}
              </a>
              <Link
                href={badgeStudioPath("profile")}
                className={`${keyGhostClass} w-full`}
              >
                {t("badge.editProfile")}
              </Link>
              <Link
                href={badgeStudioPath("photo")}
                className={`${keyGhostClass} w-full`}
              >
                {t("badge.replace")}
              </Link>
            </div>
          ) : (
            <Link
              href={badgeStudioPath(null)}
              className={`${keyClass} mt-3 w-full`}
            >
              {t("badge.create")} →
            </Link>
          )}

          <p className="mt-3 font-mono text-[10px] leading-relaxed text-[var(--text-dim)]">
            {t("badge.note")}
          </p>

          {ready && (
            <Link
              href={galleryPath(locale)}
              className="mt-3 inline-block font-mono text-[11px] text-[var(--text-dim)] underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--text)]"
            >
              → {t("badge.gallery")}
            </Link>
          )}
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
                <Kv k={t("badge.number")}>#{formattedNumber}</Kv>
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
