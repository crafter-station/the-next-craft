import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { TRACKS, trackIndex } from "@/lib/dashboard/content";
import {
  findParticipantByUserId,
  findTeamForParticipant,
} from "@/lib/dashboard/state";

import { CopyBlock } from "@/components/dashboard/copy-block";
import {
  Cell,
  keyClass,
  PageHeader,
  Panel,
  PanelHead,
  Row,
  Table,
} from "@/components/dashboard/kit";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export default async function SupportPage({
  params,
}: PageProps<"/[locale]/dashboard/support">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");

  const session = await auth.api.getSession({ headers: await headers() });
  const participant = session
    ? await findParticipantByUserId(session.user.id)
    : null;
  if (!participant) return null;

  const team = await findTeamForParticipant(participant.id);
  const trackId = team?.track ? TRACKS[trackIndex(team.track)]?.id : null;

  const template = t("support.template", {
    hub: (participant.city ?? "—").toUpperCase(),
    table: team?.tableNumber ?? "—",
    track: trackId ? `TRACK ${trackId}` : "—",
  });

  const whatsappHref = WHATSAPP
    ? `https://wa.me/${WHATSAPP.replace(/[^\d]/g, "")}`
    : "https://thenextcraft.org";

  return (
    <>
      <PageHeader
        n={80}
        label={t("support.label")}
        title={t("support.headline")}
        lede={t("support.lede")}
        aside={
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className={keyClass}
          >
            {t("support.openWhatsapp")} →
          </a>
        }
      />

      <Table className="mb-5 grid grid-cols-1 sm:grid-cols-3">
        <Cell label={t("support.responseLabel")}>
          <p className="font-mono text-[13px] text-[var(--text)]">
            {t("support.responseValue")}
          </p>
        </Cell>
        <Cell label={t("support.mentorsLabel")}>
          <p className="font-mono text-[13px] text-[var(--text)]">
            {t("support.mentorsValue")}
          </p>
        </Cell>
        <Cell label={t("support.hubsLabel")}>
          <p className="font-mono text-[13px] text-[var(--text)]">
            {t("support.hubsValue")}
          </p>
        </Cell>
      </Table>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHead
            n={84}
            label={t("support.etiquetteLabel")}
            title={t("support.etiquetteTitle")}
          />
          <ul>
            <Row marker="01">{t("support.rule1")}</Row>
            <Row marker="02">{t("support.rule2")}</Row>
            <Row marker="03">{t("support.rule3")}</Row>
            <Row marker="04">{t("support.rule4")}</Row>
            <Row marker="05">{t("support.rule5")}</Row>
          </ul>
        </Panel>

        <Panel>
          <PanelHead
            n={85}
            label={t("support.templateLabel")}
            title={t("support.templateTitle")}
          />
          <div className="px-4 py-4">
            <p className="mb-4 font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
              {t("support.templateBody")}
            </p>
            <CopyBlock
              label={t("support.templateLabel")}
              text={template}
              copyLabel={t("support.copyTemplate")}
              copiedLabel={t("support.copied")}
            />
          </div>
        </Panel>
      </div>
    </>
  );
}
