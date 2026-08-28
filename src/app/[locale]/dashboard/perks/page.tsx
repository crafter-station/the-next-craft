import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  Cell,
  PageHeader,
  Panel,
  PanelHead,
  Row,
  Table,
  Tag,
} from "@/components/dashboard/kit";

type WinnerMessage = {
  place: string;
  rewards: { partner: string; credits: string; value?: string }[];
};

/**
 * Lo que te llevas por entrar y lo que te llevas por ganar.
 *
 * Vivía al pie de la página de tracks, debajo del selector. Ahí competía con la
 * única decisión que esa página tiene que provocar —elegir track antes de que
 * cierre el kickoff— y encima es contenido que no se lee una vez y ya: los
 * créditos se consultan durante las doce horas.
 */
export default async function PerksPage({
  params,
}: PageProps<"/[locale]/dashboard/perks">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const tPrizes = await getTranslations("prizes");

  const perks = tPrizes.raw("perks") as string[];
  const winners = tPrizes.raw("winners") as WinnerMessage[];

  return (
    <>
      <PageHeader
        n={90}
        label={t("perks.label")}
        title={t("perks.headline")}
        lede={t("perks.lede")}
        aside={<Tag strong>{tPrizes("amount")}</Tag>}
      />

      <Panel>
        <PanelHead
          n={91}
          label={t("perks.prizesLabel")}
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
          n={92}
          label={t("perks.includedLabel")}
          title={t("perks.includedTitle", { count: perks.length })}
        />
        <ul>
          {perks.map((perk) => (
            <Row key={perk} marker="→">
              {perk}
            </Row>
          ))}
        </ul>
      </Panel>
    </>
  );
}
