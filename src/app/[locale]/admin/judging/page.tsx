import { getTranslations, setRequestLocale } from "next-intl/server";

import { CITIES, type CityKey } from "@/lib/cities";
import { TRACKS } from "@/lib/dashboard/content";
import {
  MIN_PANELISTS_PER_TEAM,
  MIN_TEAMS_PER_PANELIST,
} from "@/lib/judging/normalize";
import { listProjects } from "@/lib/judging/projects";
import {
  listPanelists,
  type Phase,
  panelResults,
  sharedAccessCode,
} from "@/lib/judging/state";
import { cn } from "@/lib/utils";

import { AccessCodePanel } from "@/components/admin/access-code-panel";
import { FinalistToggle } from "@/components/admin/finalist-toggle";
import { PanelistManager } from "@/components/admin/panelist-manager";
import { ProjectManager } from "@/components/admin/project-manager";
import {
  Cell,
  Empty,
  PageHeader,
  Panel,
  PanelHead,
  Pixel,
  Stat,
  Table,
  Tag,
} from "@/components/dashboard/kit";

import { Link } from "@/i18n/navigation";

const CITY_KEYS = CITIES.map((city) => city.key);
const TRACK_KEYS = TRACKS.map((track) => track.key);

function parseScope(raw: string | undefined): {
  phase: Phase;
  city: CityKey | null;
} {
  if (raw === "final") return { phase: "final", city: null };
  const city = CITY_KEYS.find((key) => key === raw) ?? CITY_KEYS[0];
  return { phase: "sede", city };
}

/**
 * El tablero del comité.
 *
 * Enseña un panel a la vez, y eso es la regla de negocio, no una comodidad de
 * navegación: los puntajes de dos sedes distintas NO son comparables —no
 * comparten mentores ni equipos, así que no hay nada que los ponga en la misma
 * escala— y una tabla que los mezclara invitaría exactamente a la comparación
 * que no se puede hacer. La fase final sí es un panel único sobre todos los
 * finalistas, y por eso ahí sí sale una tabla sola.
 */
export default async function AdminJudgingPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/judging">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const scopeParam = Array.isArray(query.scope) ? query.scope[0] : query.scope;
  const { phase, city } = parseScope(scopeParam);

  const t = await getTranslations("admin.judging");
  const [summary, panelists, projects, accessCode] = await Promise.all([
    panelResults(phase, city),
    listPanelists(),
    listProjects(),
    sharedAccessCode(),
  ]);

  const { result } = summary;
  const scored = result.teams.length;

  /*
    Rank dentro del track, además del rank del panel.

    Es la columna M de la hoja de evaluación, y no es decoración: los premios
    son por track, así que el 4.º del panel puede ser el 1.º de su track. El
    orden ya viene resuelto con todo el desempate aplicado, de modo que contar
    posiciones por track sobre esa lista respeta la misma cadena.
  */
  const rankInTrack = new Map<string, number>();
  const seenPerTrack = new Map<string, number>();
  for (const team of result.teams) {
    const track = summary.teams.get(team.teamId)?.track ?? "—";
    const next = (seenPerTrack.get(track) ?? 0) + 1;
    seenPerTrack.set(track, next);
    rankInTrack.set(team.teamId, next);
  }
  const flagged = result.teams.filter((team) => team.flags.length > 0).length;

  return (
    <>
      <PageHeader
        n={10}
        label={t("label")}
        title={t("headline")}
        lede={t("lede")}
        aside={
          <Tag strong={result.complete}>
            {result.complete ? t("designComplete") : t("designPartial")}
          </Tag>
        }
      />

      <nav className="mb-5 flex flex-wrap gap-1">
        {CITY_KEYS.map((key) => (
          <Link
            key={key}
            href={{ pathname: "/admin/judging", query: { scope: key } }}
            className={cn(
              "border px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors",
              phase === "sede" && city === key
                ? "border-[var(--bone)] bg-[var(--bone)] text-[var(--void)]"
                : "border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--bright)]",
            )}
          >
            {key}
          </Link>
        ))}
        <Link
          href={{ pathname: "/admin/judging", query: { scope: "final" } }}
          className={cn(
            "border px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors",
            phase === "final"
              ? "border-[var(--bone)] bg-[var(--bone)] text-[var(--void)]"
              : "border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--bright)]",
          )}
        >
          {t("scopeFinal")}
        </Link>
      </nav>

      {!result.connected && (
        <Panel className="mb-5 border-[var(--destructive)]/50">
          <div className="px-4 py-4">
            <Pixel size="md" className="text-[var(--destructive)]">
              {t("disconnectedTitle")}
            </Pixel>
            <p className="mt-3 font-mono text-[12px] leading-relaxed text-[var(--text-dim)]">
              {t("disconnectedBody", { groups: result.islands.length })}
            </p>
          </div>
        </Panel>
      )}

      <Table className="mb-5 grid grid-cols-2 sm:grid-cols-4">
        <Stat value={scored} label={t("statTeams")} />
        <Stat value={result.panelists.length} label={t("statPanelists")} />
        <Stat
          value={flagged}
          label={t("statFlagged")}
          hint={t("statFlaggedHint", { min: MIN_PANELISTS_PER_TEAM })}
        />
        <Stat
          value={result.complete ? t("yes") : t("no")}
          label={t("statComplete")}
          hint={t("statCompleteHint")}
        />
      </Table>

      <AccessCodePanel code={accessCode} />

      <ProjectManager
        projects={projects}
        cities={CITY_KEYS}
        tracks={TRACK_KEYS}
      />

      <Panel className="mb-5">
        <PanelHead n={20} label={t("rankingLabel")} title={t("rankingTitle")} />
        {result.teams.length === 0 ? (
          <Empty>{t("rankingEmpty")}</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] border-collapse font-mono text-[12px]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[10px] tracking-[0.12em] uppercase text-[var(--text-dim)]">
                  <th className="px-4 py-2.5 text-left">#</th>
                  <th className="px-4 py-2.5 text-left">{t("colTeam")}</th>
                  <th className="px-2 py-2.5 text-left">{t("colTrack")}</th>
                  <th className="px-4 py-2.5 text-right">{t("colIndex")}</th>
                  <th className="px-4 py-2.5 text-right">{t("colRaw")}</th>
                  <th className="px-4 py-2.5 text-right">{t("colHundred")}</th>
                  <th className="px-4 py-2.5 text-right">
                    {t("colPanelists")}
                  </th>
                  <th className="px-4 py-2.5 text-right">{t("colSpread")}</th>
                  <th className="px-4 py-2.5 text-left">{t("colFinalist")}</th>
                </tr>
              </thead>
              <tbody>
                {result.teams.map((team) => {
                  const meta = summary.teams.get(team.teamId);
                  return (
                    <tr
                      key={team.teamId}
                      className="border-b border-[var(--line)] last:border-b-0"
                    >
                      <td className="px-4 py-3 text-left tabular-nums text-[var(--text-dim)]">
                        {team.rank}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <span className="text-[var(--text)]">
                          {meta?.name ?? team.teamId}
                        </span>
                        {team.flags.includes("few-panelists") && (
                          <Tag className="ml-2">
                            {t("flagFewPanelists", {
                              min: MIN_PANELISTS_PER_TEAM,
                            })}
                          </Tag>
                        )}
                      </td>
                      <td className="px-2 py-3 text-left text-[var(--text-dim)]">
                        {meta?.track ? (
                          <>
                            {t(`track.${meta.track}`)}{" "}
                            <span className="text-[var(--line-strong)]">
                              #{rankInTrack.get(team.teamId)}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--bright)]">
                        {team.index}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--text-dim)]">
                        {team.raw.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--text)]">
                        {Math.round(team.raw * 20)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--text-dim)]">
                        {team.panelists}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--text-dim)]">
                        {team.spread.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-left">
                        {phase === "sede" ? (
                          <FinalistToggle
                            teamId={team.teamId}
                            finalist={meta?.finalist ?? false}
                          />
                        ) : (
                          <span className="text-[var(--line-strong)]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-[var(--line)] px-4 py-3 font-mono text-[11px] leading-relaxed text-[var(--text-dim)]">
          {t("rankingNote")}
        </p>
      </Panel>

      <Panel className="mb-5">
        <PanelHead n={30} label={t("panelLabel")} title={t("panelTitle")} />
        {result.panelists.length === 0 ? (
          <Empty>{t("panelEmpty")}</Empty>
        ) : (
          <Table className="sm:grid sm:grid-cols-2">
            {result.panelists.map((stat) => (
              <Cell key={stat.panelistId}>
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 truncate font-mono text-[13px] text-[var(--text)]">
                    {summary.panelistNames.get(stat.panelistId)}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-[var(--text-dim)]">
                    {t("panelTeams", { count: stat.teams })}
                  </span>
                </div>
                <p className="mt-2 font-mono text-[11px] tabular-nums text-[var(--text-dim)]">
                  {t("panelStats", {
                    mean: stat.mean.toFixed(2),
                    sigma: stat.sigma.toFixed(2),
                    agreement:
                      stat.agreement === null ? "—" : stat.agreement.toFixed(2),
                  })}
                </p>
                {stat.flags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {stat.flags.map((flag) => (
                      <Tag key={flag}>
                        {t(`flag.${flag}`, { min: MIN_TEAMS_PER_PANELIST })}
                      </Tag>
                    ))}
                  </div>
                )}
              </Cell>
            ))}
          </Table>
        )}
        <p className="border-t border-[var(--line)] px-4 py-3 font-mono text-[11px] leading-relaxed text-[var(--text-dim)]">
          {t("panelNote")}
        </p>
      </Panel>

      <PanelistManager
        panelists={panelists}
        cities={CITY_KEYS as unknown as string[]}
      />
    </>
  );
}
