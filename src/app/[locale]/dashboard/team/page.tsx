import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import {
  countTeamsInCity,
  findParticipantByUserId,
  findTeamForParticipant,
} from "@/lib/dashboard/state";
import { MAX_TEAM_SIZE, MIN_TEAM_SIZE } from "@/lib/dashboard/team-limits";

import {
  Kv,
  PageHeader,
  Panel,
  PanelHead,
  Row,
  Tag,
} from "@/components/dashboard/kit";
import {
  JoinCode,
  LeaveTeamButton,
  TeamDetailsForm,
  TeamOnboarding,
} from "@/components/dashboard/team-forms";

export default async function TeamPage({
  params,
}: PageProps<"/[locale]/dashboard/team">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const participant = await findParticipantByUserId(session.user.id);
  if (!participant) return null;

  const team = await findTeamForParticipant(participant.id);
  const teamsInCity = await countTeamsInCity(participant.city);

  if (!team) {
    return (
      <>
        <PageHeader
          n={30}
          label={t("team.label")}
          title={t("team.headlineEmpty")}
          lede={t("team.ledeEmpty", { min: MIN_TEAM_SIZE, max: MAX_TEAM_SIZE })}
          aside={<Tag>{t("team.inCity", { count: teamsInCity })}</Tag>}
        />
        <TeamOnboarding />
      </>
    );
  }

  const short = team.members.length < MIN_TEAM_SIZE;

  return (
    <>
      <PageHeader
        n={30}
        label={t("team.label")}
        title={team.name.toUpperCase()}
        lede={t("team.ledeTeam", { max: MAX_TEAM_SIZE })}
        aside={
          <div className="flex flex-wrap gap-1.5">
            <Tag strong={!short}>
              {t("team.size", {
                count: team.members.length,
                max: MAX_TEAM_SIZE,
              })}
            </Tag>
            <Tag>{t("team.inCity", { count: teamsInCity })}</Tag>
          </div>
        }
      />

      {short && (
        <Panel className="mb-5">
          <div className="px-4 py-3.5">
            <p className="font-mono text-[11px] leading-none tracking-[0.14em] uppercase text-[var(--text-dim)]">
              <span className="text-[var(--bright)]">33 </span>PRINT &quot;
              {t("team.shortLabel")}&quot;
            </p>
            <p className="mt-2.5 font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
              {t("team.shortBody", { min: MIN_TEAM_SIZE })}
            </p>
          </div>
        </Panel>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Panel screen>
            <PanelHead
              n={34}
              label={t("team.shareLabel")}
              title={t("team.shareTitle")}
            />
            <JoinCode code={team.joinCode} />
          </Panel>

          <Panel>
            <PanelHead
              n={35}
              label={t("team.membersLabel")}
              title={t("team.size", {
                count: team.members.length,
                max: MAX_TEAM_SIZE,
              })}
            />
            <ul>
              {team.members.map((m) => (
                <Row key={m.participantId} marker="▸">
                  <span className="text-[var(--text)]">{m.fullName}</span>
                  {m.participantId === participant.id && (
                    <span className="ml-2 text-[11px] text-[var(--bright)]">
                      {t("overview.you")}
                    </span>
                  )}
                  {m.isCaptain && (
                    <span className="ml-2 text-[11px]">
                      {t("team.captain")}
                    </span>
                  )}
                </Row>
              ))}
            </ul>
            <div className="border-t border-[var(--line)] px-4 py-3.5">
              <Kv k={t("team.hub")}>{participant.city ?? "—"}</Kv>
              <Kv k={t("team.table")}>{team.tableNumber ?? "—"}</Kv>
            </div>
            <LeaveTeamButton />
          </Panel>
        </div>

        <Panel>
          <PanelHead
            n={36}
            label={t("team.detailsLabel")}
            title={t("team.detailsTitle")}
          />
          <TeamDetailsForm
            name={team.name}
            pitch={team.pitch ?? ""}
            repoUrl={team.repoUrl ?? ""}
            demoUrl={team.demoUrl ?? ""}
          />
        </Panel>
      </div>
    </>
  );
}
