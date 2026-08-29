import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import {
  findParticipantByUserId,
  findTeamForParticipant,
  listMentorTables,
  listMyBookings,
} from "@/lib/dashboard/state";

import {
  Empty,
  PageHeader,
  Panel,
  PanelHead,
  Row,
  Tag,
} from "@/components/dashboard/kit";
import { MentorCard } from "@/components/dashboard/mentor-card";

export default async function MentorsPage({
  params,
}: PageProps<"/[locale]/dashboard/mentors">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");

  const session = await auth.api.getSession({ headers: await headers() });
  const participant = session
    ? await findParticipantByUserId(session.user.id)
    : null;
  if (!participant) return null;

  const team = await findTeamForParticipant(participant.id);
  const [tables, bookings] = await Promise.all([
    listMentorTables(team?.id ?? null),
    listMyBookings(team?.id ?? null),
  ]);

  const freeSlots = tables.reduce(
    (n, table) => n + table.slots.filter((s) => !s.taken).length,
    0,
  );

  return (
    <>
      <PageHeader
        n={50}
        label={t("mentors.label")}
        title={t("mentors.headline")}
        lede={t("mentors.lede")}
        aside={
          <div className="flex flex-wrap gap-1.5">
            <Tag strong={freeSlots > 0}>
              {t("mentors.freeSlots", { count: freeSlots })}
            </Tag>
            <Tag>{t("mentors.tables", { count: tables.length })}</Tag>
          </div>
        }
      />

      <Panel className="mb-5">
        <PanelHead
          n={45}
          label={t("mentors.myBookingsLabel")}
          title={
            bookings.length
              ? t("mentors.myBookingsTitle", { count: bookings.length })
              : t("mentors.noBookingsTitle")
          }
        />
        {bookings.length === 0 ? (
          <Empty>{t("mentors.noBookings")}</Empty>
        ) : (
          <ul>
            {bookings.map((b) => (
              <Row key={b.slotId} marker="→">
                <span className="text-[var(--text)]">{b.org}</span>
                <span className="ml-2 text-[11px]">
                  {t(`mentors.roles.${b.role}`)}
                </span>
                <span className="mt-1 block text-[12px] text-[var(--bright)]">
                  {b.startsAt}–{b.endsAt}
                </span>
                {b.topic && (
                  <span className="mt-2 block max-w-xl text-[12px] leading-relaxed">
                    {b.topic}
                  </span>
                )}
              </Row>
            ))}
          </ul>
        )}
      </Panel>

      {tables.length === 0 ? (
        <Panel>
          <Empty>{t("mentors.noSlots")}</Empty>
        </Panel>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          {tables.map((table, i) => (
            <MentorCard
              key={table.id}
              table={table}
              index={i + 1}
              isMyTable={team?.mentorTableId === table.id}
              hasTeam={Boolean(team)}
            />
          ))}
        </div>
      )}
    </>
  );
}
