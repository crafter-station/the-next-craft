import { getTranslations, setRequestLocale } from "next-intl/server";

import { CRITERIA } from "@/lib/judging/rubric";
import { currentPanelist, teamsForPanelist } from "@/lib/judging/state";

import {
  Cell,
  Empty,
  PageHeader,
  Panel,
  Pixel,
  Table,
  Tag,
} from "@/components/dashboard/kit";

import { Link } from "@/i18n/navigation";

/**
 * La cola de trabajo del panelista.
 *
 * Lo primero que hay que responder al entrar es «¿cuánto me falta?», no «¿qué
 * hay?»: el panelista está de pie en una sala con ruido y el tiempo de la
 * ronda corriendo. Por eso el contador va arriba y la lista se ordena dejando
 * lo pendiente delante.
 */
export default async function JudgeQueuePage({
  params,
}: PageProps<"/[locale]/judge">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("judging");
  const panelist = await currentPanelist();
  if (!panelist) return null;

  const teams = await teamsForPanelist(panelist);
  const done = teams.filter((team) => team.own?.submittedAt).length;

  const ordered = [...teams].sort((a, b) => {
    const rank = (submitted: boolean, draft: boolean) =>
      submitted ? 2 : draft ? 0 : 1;
    const ra = rank(Boolean(a.own?.submittedAt), Boolean(a.own));
    const rb = rank(Boolean(b.own?.submittedAt), Boolean(b.own));
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <PageHeader
        n={10}
        label={t("queue.label")}
        title={t("queue.title")}
        lede={t(`queue.lede.${panelist.role}`)}
        aside={
          <div className="text-right">
            <Pixel size="xl">
              {done}/{teams.length}
            </Pixel>
            <p className="mt-2 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
              {t("queue.progress")}
            </p>
          </div>
        }
      />

      {teams.length === 0 ? (
        <Panel>
          <Empty>{t(`queue.empty.${panelist.role}`)}</Empty>
        </Panel>
      ) : (
        <Table className="sm:grid sm:grid-cols-2">
          {ordered.map((team) => {
            const submitted = Boolean(team.own?.submittedAt);
            const draft = Boolean(team.own) && !submitted;
            return (
              <Cell key={team.id} className="p-0">
                <Link
                  href={`/judge/${team.slug}`}
                  className="block px-4 py-4 transition-colors hover:bg-[var(--void)] focus-visible:bg-[var(--void)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Pixel size="md" className="min-w-0 truncate">
                      {team.name}
                    </Pixel>
                    <Tag strong={submitted}>
                      {submitted
                        ? t("status.submitted")
                        : draft
                          ? t("status.draft")
                          : t("status.pending")}
                    </Tag>
                  </div>
                  <p className="mt-2 font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--text-dim)]">
                    {[
                      team.track ? t(`track.${team.track}`) : null,
                      team.city?.toUpperCase(),
                      team.tableNumber
                        ? t("queue.table", { number: team.tableNumber })
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {team.pitch && (
                    <p className="mt-3 line-clamp-2 font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
                      {team.pitch}
                    </p>
                  )}
                </Link>
              </Cell>
            );
          })}
        </Table>
      )}

      <Panel className="mt-8">
        <div className="border-b border-[var(--line)] px-4 py-3.5">
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
            {t("rubric.title")}
          </p>
        </div>
        <ul>
          {CRITERIA.map((criterion) => (
            <li
              key={criterion.key}
              className="flex items-baseline gap-4 border-b border-[var(--line)] px-4 py-3 last:border-b-0"
            >
              <Pixel size="md" className="w-14 shrink-0 tabular-nums">
                {Math.round(criterion.weight * 100)}%
              </Pixel>
              <div className="min-w-0">
                <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--text)]">
                  {t(`criteria.${criterion.key}.name`)}
                </p>
                <p className="mt-1 font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
                  {t(`criteria.${criterion.key}.desc`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
