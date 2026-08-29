import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { listAssignedCodesForParticipant } from "@/lib/admin/perks";
import { auth } from "@/lib/auth";
import { PARTNERS, TOTAL_PARTNER_VALUE_USD } from "@/lib/dashboard/content";
import {
  findParticipantByUserId,
  listRedeemedPartners,
} from "@/lib/dashboard/state";

import {
  PageHeader,
  Panel,
  PanelHead,
  Row,
  Stat,
  Table,
  Tag,
} from "@/components/dashboard/kit";
import { PartnerCard } from "@/components/dashboard/partner-card";

export default async function CreditsPage({
  params,
}: PageProps<"/[locale]/dashboard/credits">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");

  const session = await auth.api.getSession({ headers: await headers() });
  const participant = session
    ? await findParticipantByUserId(session.user.id)
    : null;
  if (!participant) return null;

  const redeemed = await listRedeemedPartners(participant.id);
  const assignedCodes = await listAssignedCodesForParticipant(participant.id);
  const claimed = PARTNERS.filter((p) => redeemed.has(p.key)).reduce(
    (sum, p) => sum + p.valueUsd,
    0,
  );
  const pct = Math.round((claimed / TOTAL_PARTNER_VALUE_USD) * 100);

  return (
    <>
      <PageHeader
        n={70}
        label={t("credits.label")}
        title={t("credits.headline")}
        lede={t("credits.lede")}
        aside={
          <div className="flex flex-wrap gap-1.5">
            <Tag strong>
              {t("credits.claimed", {
                claimed,
                total: TOTAL_PARTNER_VALUE_USD,
              })}
            </Tag>
            <Tag>
              {t("credits.redeemedCount", {
                done: redeemed.size,
                total: PARTNERS.length,
              })}
            </Tag>
          </div>
        }
      />

      <Table className="mb-5 grid grid-cols-2 sm:grid-cols-4">
        <Stat
          value={`$${TOTAL_PARTNER_VALUE_USD}`}
          label={t("credits.statTotal")}
          hint={t("credits.partnersHint", { count: PARTNERS.length })}
        />
        <Stat
          value={`$${claimed}`}
          label={t("credits.statClaimed")}
          hint={t("credits.pctHint", { pct })}
        />
        <Stat
          value={PARTNERS.length - redeemed.size}
          label={t("credits.statPending")}
          hint={t("credits.expiryHint")}
        />
        <Stat
          value={PARTNERS.filter((p) => p.perParticipant).length}
          label={t("credits.statPerPerson")}
          hint={t("credits.perPersonHint")}
        />
      </Table>

      <Panel className="mb-5">
        <PanelHead
          n={71}
          label={t("credits.rulesLabel")}
          title={t("credits.rulesTitle")}
        />
        <ul>
          <Row marker="01">{t("credits.rule1")}</Row>
          <Row marker="02">{t("credits.rule2")}</Row>
          <Row marker="03">{t("credits.rule3")}</Row>
          <Row marker="04">{t("credits.rule4")}</Row>
        </ul>
      </Panel>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {PARTNERS.map((partner, i) => (
          <PartnerCard
            key={partner.key}
            partner={partner}
            index={i + 1}
            code={assignedCodes.get(partner.key) ?? null}
            redeemed={redeemed.has(partner.key)}
          />
        ))}
      </div>
    </>
  );
}
