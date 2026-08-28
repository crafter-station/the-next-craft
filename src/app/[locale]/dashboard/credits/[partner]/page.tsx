import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { listAssignedCodesForParticipant } from "@/lib/admin/perks";
import { auth } from "@/lib/auth";
import { PARTNERS } from "@/lib/dashboard/content";
import {
  findParticipantByUserId,
  getParticipantPerkEligibility,
  listRedeemedPartners,
} from "@/lib/dashboard/state";

import {
  PageHeader,
  Panel,
  PanelHead,
  Row,
  Tag,
} from "@/components/dashboard/kit";
import { PartnerCard } from "@/components/dashboard/partner-card";

import { Link } from "@/i18n/navigation";

/** Una página por partner, como el submenú de sponsors de la plataforma origen. */
export default async function PartnerPage({
  params,
}: PageProps<"/[locale]/dashboard/credits/[partner]">) {
  const { locale, partner: partnerKey } = await params;
  setRequestLocale(locale);

  const index = PARTNERS.findIndex((p) => p.key === partnerKey);
  if (index === -1) notFound();
  const partner = PARTNERS[index];

  const t = await getTranslations("dashboard");
  const session = await auth.api.getSession({ headers: await headers() });
  const participant = session
    ? await findParticipantByUserId(session.user.id)
    : null;
  if (!participant) return null;

  const redeemed = await listRedeemedPartners(participant.id);
  const assignedCodes = await listAssignedCodesForParticipant(participant.id);
  const perkEligibility = await getParticipantPerkEligibility(participant.id);
  const code = assignedCodes.get(partner.key) ?? null;

  return (
    <>
      <PageHeader
        n={70 + index + 1}
        label={`${t("credits.label")} · ${partner.name}`}
        title={t(`credits.partners.${partner.key}.perk`).toUpperCase()}
        lede={t(`credits.partners.${partner.key}.about`)}
        aside={
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Tag strong={redeemed.has(partner.key)}>
              {!code
                ? t("credits.codePendingLabel")
                : redeemed.has(partner.key)
                  ? t("credits.yourCode")
                  : !perkEligibility.canRedeem
                    ? !perkEligibility.hasBadge
                      ? t("credits.badgeRequiredLabel")
                      : t("credits.checkInRequiredLabel")
                    : t("credits.codeHidden")}
            </Tag>
            <Link
              href="/dashboard/credits"
              className="font-mono text-[11px] text-[var(--text-dim)] hover:text-[var(--bright)]"
            >
              ← {t("nav.credits")}
            </Link>
          </div>
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <PartnerCard
          partner={partner}
          index={index + 1}
          code={code}
          redeemed={redeemed.has(partner.key)}
          canRedeem={perkEligibility.canRedeem}
          perkEligibility={perkEligibility}
          detailed
        />

        <Panel>
          <PanelHead
            n={76}
            label={t("credits.rulesLabel")}
            title={t("credits.rulesTitle")}
          />
          <ul>
            <Row marker="01">{t("credits.rule1")}</Row>
            <Row marker="02">{t("credits.rule2")}</Row>
            <Row marker="03">{t("credits.rule3")}</Row>
            <Row marker="04">{t("credits.rule4")}</Row>
            <Row marker="05">{t("credits.rule5")}</Row>
          </ul>
        </Panel>
      </div>
    </>
  );
}
