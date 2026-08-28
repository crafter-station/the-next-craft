import { getTranslations, setRequestLocale } from "next-intl/server";

import { CITIES, type CityKey } from "@/lib/cities";
import { githubEnabled, listTeamRepos } from "@/lib/dashboard/github";
import { currentStaffEmail } from "@/lib/dashboard/staff";
import { listRoster, rosterTotals } from "@/lib/dashboard/staff-roster";
import { cn } from "@/lib/utils";

import {
  Empty,
  PageHeader,
  Panel,
  PanelHead,
  Row,
  Stat,
  Table,
  Tag,
} from "@/components/dashboard/kit";
import { RosterRow } from "@/components/dashboard/roster-row";

import { Link } from "@/i18n/navigation";

const CITY_KEYS = CITIES.map((city) => city.key);

export default async function AdminStaffPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/staff">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const t = await getTranslations("dashboard");
  const tCities = await getTranslations("cities");

  const staffEmail = await currentStaffEmail();
  if (!staffEmail) return null;

  const rawCity = typeof sp.city === "string" ? sp.city : null;
  const city = (CITY_KEYS as readonly string[]).includes(rawCity ?? "")
    ? (rawCity as CityKey)
    : null;
  const search = typeof sp.q === "string" ? sp.q : "";

  const [roster, totals, repos] = await Promise.all([
    listRoster({ city, search }),
    rosterTotals(city),
    githubEnabled() ? listTeamRepos(city) : Promise.resolve([]),
  ]);

  const href = (over: { city?: string; q?: string }) => {
    const query: Record<string, string> = {};
    const nextCity = "city" in over ? over.city : (city ?? undefined);
    const nextQ = "q" in over ? over.q : search || undefined;
    if (nextCity) query.city = nextCity;
    if (nextQ) query.q = nextQ;
    return { pathname: "/admin/staff" as const, query };
  };

  return (
    <>
      <PageHeader
        n={90}
        label={t("staff.label")}
        title={t("staff.headline")}
        lede={t("staff.lede")}
        aside={<Tag strong>{staffEmail}</Tag>}
      />

      <Table className="mb-4 grid grid-cols-2 sm:grid-cols-4">
        <Stat
          value={`${totals.arrived}/${totals.expected}`}
          label={t("staff.statArrived")}
        />
        <Stat value={totals.merch} label={t("staff.statMerch")} />
        <Stat
          value={totals.withBadge}
          label={t("staff.statBadge")}
          hint={t("staff.statBadgeHint")}
        />
        <Stat
          value={totals.expected - totals.arrived}
          label={t("staff.statPending")}
        />
      </Table>

      <div className="mb-4 flex flex-wrap items-center gap-1.5 border border-[var(--line)] bg-[var(--screen-dim)] px-3 py-2.5">
        <Link
          href={href({ city: undefined })}
          className={cn(
            "border px-2 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors",
            !city
              ? "border-[var(--bone)] bg-[var(--bone)] text-[var(--void)]"
              : "border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--bright)]",
          )}
        >
          {t("staff.allHubs")}
        </Link>
        {CITY_KEYS.map((key) => (
          <Link
            key={key}
            href={href({ city: key })}
            className={cn(
              "border px-2 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors",
              city === key
                ? "border-[var(--bone)] bg-[var(--bone)] text-[var(--void)]"
                : "border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--bright)]",
            )}
          >
            {tCities(key)}
          </Link>
        ))}
      </div>

      <form
        action={`/${locale}/admin/staff`}
        method="get"
        className="mb-4 flex gap-2"
      >
        {city && <input type="hidden" name="city" value={city} />}
        <input
          name="q"
          defaultValue={search}
          placeholder={t("staff.searchPlaceholder")}
          aria-label={t("staff.searchPlaceholder")}
          className="min-w-0 flex-1 border border-[var(--line)] bg-[var(--void)] px-3 py-2.5 font-mono text-[13px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:border-[var(--bright)] focus:outline-none"
        />
        <button
          type="submit"
          className="keycap px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase"
        >
          {t("staff.search")}
        </button>
      </form>

      <Panel>
        {roster.length === 0 ? (
          <Empty>{t("staff.empty")}</Empty>
        ) : (
          <ul>
            {roster.map((entry) => (
              <RosterRow key={entry.participantId} entry={entry} />
            ))}
          </ul>
        )}
      </Panel>

      <p className="mt-4 font-mono text-[11px] text-[var(--text-dim)]">
        {t("staff.footer", { shown: roster.length, total: totals.expected })}
      </p>

      {githubEnabled() && (
        <Panel className="mt-5">
          <PanelHead
            n={91}
            label={t("staff.reposLabel")}
            title={t("staff.reposTitle")}
          />
          {repos.length === 0 ? (
            <Empty>{t("staff.reposEmpty")}</Empty>
          ) : (
            <ul>
              {repos.map((repo) => (
                <Row key={repo.teamId} marker="▸">
                  <span className="text-[var(--text)]">{repo.name}</span>
                  {repo.city && (
                    <span className="ml-2 text-[11px] uppercase">
                      {tCities(repo.city)}
                    </span>
                  )}
                  {repo.url ? (
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-[11px] text-[var(--bright)] underline underline-offset-4"
                    >
                      {repo.fullName}
                    </a>
                  ) : (
                    <span className="ml-2 text-[11px]">
                      {t("staff.reposMissing")}
                    </span>
                  )}
                </Row>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </>
  );
}
