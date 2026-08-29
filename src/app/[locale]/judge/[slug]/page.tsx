import { notFound } from "next/navigation";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { currentPanelist, teamsForPanelist } from "@/lib/judging/state";

import { Kv, PageHeader, Panel, Tag } from "@/components/dashboard/kit";
import { ScoreForm } from "@/components/judging/score-form";

import { Link } from "@/i18n/navigation";

export default async function ScoreTeamPage({
  params,
}: PageProps<"/[locale]/judge/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("judging");
  const panelist = await currentPanelist();
  if (!panelist) return null;

  // Se busca dentro del alcance del panelista, no en toda la tabla: si el
  // equipo no es suyo, para él no existe.
  const teams = await teamsForPanelist(panelist);
  const team = teams.find((candidate) => candidate.slug === slug);
  if (!team) notFound();

  const locked = Boolean(team.own?.submittedAt);

  return (
    <>
      <PageHeader
        n={20}
        label={t("score.label")}
        title={team.name}
        lede={team.pitch ?? undefined}
        aside={
          <Link
            href="/judge"
            className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--text-dim)] hover:text-[var(--bright)]"
          >
            ← {t("score.back")}
          </Link>
        }
      />

      <Panel className="mb-4 px-4 py-1">
        <Kv k={t("score.track")}>
          {team.track ? t(`track.${team.track}`) : "—"}
        </Kv>
        {team.tableNumber && <Kv k={t("score.table")}>{team.tableNumber}</Kv>}
        {team.demoUrl && (
          <Kv k={t("score.demo")}>
            <a
              href={team.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-[var(--bright)]"
            >
              {team.demoUrl}
            </a>
          </Kv>
        )}
        {team.repoUrl && (
          <Kv k={t("score.repo")}>
            <a
              href={team.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-[var(--bright)]"
            >
              {team.repoUrl}
            </a>
          </Kv>
        )}
        <Kv k={t("score.state")}>
          <Tag strong={locked}>
            {locked ? t("status.submitted") : t("status.pending")}
          </Tag>
        </Kv>
      </Panel>

      <ScoreForm
        teamId={team.id}
        initialScores={team.own?.scores ?? {}}
        initialEvidence={team.own?.evidence ?? {}}
        locked={locked}
      />
    </>
  );
}
