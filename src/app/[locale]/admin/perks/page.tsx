import { getTranslations, setRequestLocale } from "next-intl/server";

import { partnerCodeStats } from "@/lib/admin/perks";

import { PerksUpload } from "@/components/admin/perks-upload";
import {
  PageHeader,
  Panel,
  Stat,
  Table,
  Tag,
} from "@/components/dashboard/kit";

export default async function AdminPerksPage({
  params,
}: PageProps<"/[locale]/admin/perks">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin.perks");
  const stats = await partnerCodeStats();
  const totalAssigned = stats.reduce((sum, row) => sum + row.assigned, 0);
  const totalConfirmed = stats[0]?.confirmed ?? 0;
  const totalSlots = totalConfirmed * stats.length;

  return (
    <>
      <PageHeader
        n={10}
        label={t("label")}
        title={t("headline")}
        lede={t("lede")}
        aside={
          <Tag strong>
            {t("assignedTag", { assigned: totalAssigned, total: totalSlots })}
          </Tag>
        }
      />

      <Table className="mb-5 grid grid-cols-2 sm:grid-cols-4">
        <Stat
          value={totalConfirmed}
          label={t("statConfirmed")}
          hint={t("statConfirmedHint")}
        />
        <Stat
          value={totalAssigned}
          label={t("statAssigned")}
          hint={t("statAssignedHint")}
        />
        <Stat
          value={stats.length}
          label={t("statPartners")}
          hint={t("statPartnersHint")}
        />
        <Stat
          value={Math.max(totalSlots - totalAssigned, 0)}
          label={t("statPending")}
          hint={t("statPendingHint")}
        />
      </Table>

      <PerksUpload />

      <Panel className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse font-mono text-[12px]">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-[10px] tracking-[0.12em] uppercase text-[var(--text-dim)]">
              <th className="px-4 py-3">{t("tablePartner")}</th>
              <th className="px-4 py-3">{t("tableAssigned")}</th>
              <th className="px-4 py-3">{t("tableConfirmed")}</th>
              <th className="px-4 py-3">{t("tableMissing")}</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((row) => (
              <tr
                key={row.partnerKey}
                className="border-b border-[var(--line)] last:border-b-0"
              >
                <td className="px-4 py-3 text-[var(--text)]">
                  {row.partnerName}
                </td>
                <td className="px-4 py-3 text-[var(--bright)]">
                  {row.assigned}
                </td>
                <td className="px-4 py-3 text-[var(--text-dim)]">
                  {row.confirmed}
                </td>
                <td className="px-4 py-3">
                  <Tag strong={row.unassigned === 0}>{row.unassigned}</Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
