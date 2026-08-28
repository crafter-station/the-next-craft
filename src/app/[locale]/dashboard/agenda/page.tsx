import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { buildAgenda, type ScheduleMessage } from "@/lib/dashboard/agenda";
import {
  findParticipantByUserId,
  listSavedAgenda,
} from "@/lib/dashboard/state";
import {
  cityClockLabel,
  cityTimeZone,
  resolveNow,
  statusOf,
} from "@/lib/dashboard/time";
import { cn } from "@/lib/utils";

import { AgendaToggle } from "@/components/dashboard/agenda-toggle";
import { Empty, PageHeader, Panel, Tag } from "@/components/dashboard/kit";

import { Link } from "@/i18n/navigation";

const KINDS = [
  "all",
  "ceremony",
  "hacking",
  "mentoring",
  "meal",
  "deadline",
  "demo",
] as const;

export default async function AgendaPage({
  params,
  searchParams,
}: PageProps<"/[locale]/dashboard/agenda">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const t = await getTranslations("dashboard");
  const tSchedule = await getTranslations("schedule");

  const session = await auth.api.getSession({ headers: await headers() });
  const participant = session
    ? await findParticipantByUserId(session.user.id)
    : null;
  if (!participant) return null;

  const saved = await listSavedAgenda(participant.id);
  const { now } = resolveNow(participant.city);

  const rawKind = typeof sp.kind === "string" ? sp.kind : "all";
  const kind = (KINDS as readonly string[]).includes(rawKind) ? rawKind : "all";
  const all = buildAgenda(tSchedule.raw("events") as ScheduleMessage[]);
  const blocks = all.filter((b) => (kind === "all" ? true : b.kind === kind));

  const past = all.filter(
    (b) => statusOf(b.time, b.end, now, participant.city) === "past",
  ).length;

  const href = (over: Record<string, string | undefined>) => {
    const merged: Record<string, string | undefined> = {
      kind: kind === "all" ? undefined : kind,
      ...over,
    };
    const query = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => Boolean(v)),
    ) as Record<string, string>;
    return { pathname: "/dashboard/agenda" as const, query };
  };

  return (
    <>
      <PageHeader
        n={40}
        label={t("agenda.label")}
        title={t("agenda.headline")}
        lede={t("agenda.lede")}
        aside={
          <div className="flex flex-wrap gap-1.5">
            <Tag>{t("agenda.saved", { count: saved.size })}</Tag>
            <Tag>{t("agenda.past", { done: past, total: all.length })}</Tag>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-1.5 border border-[var(--line)] bg-[var(--screen-dim)] px-3 py-2.5">
        <span className="mr-1 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
          {t("agenda.filter")}
        </span>
        {KINDS.map((k) => (
          <Link
            key={k}
            href={href({ kind: k === "all" ? undefined : k })}
            className={cn(
              "border px-2 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors",
              kind === k
                ? "border-[var(--bone)] bg-[var(--bone)] text-[var(--void)]"
                : "border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--bright)]",
            )}
          >
            {k === "all" ? t("agenda.all") : t(`kinds.${k}`)}
          </Link>
        ))}
      </div>

      <Panel screen>
        {blocks.length === 0 ? (
          <Empty>{t("agenda.empty")}</Empty>
        ) : (
          <ul>
            {blocks.map((b) => {
              const status = statusOf(b.time, b.end, now, participant.city);
              return (
                <li
                  key={b.time}
                  className={cn(
                    "flex border-b border-[var(--line)] last:border-b-0",
                    status === "past" && "opacity-45",
                  )}
                >
                  <div
                    className={cn(
                      "w-[86px] shrink-0 border-r px-3 py-3.5 sm:w-[104px]",
                      status === "now"
                        ? "border-[var(--bright)]"
                        : "border-[var(--line)]",
                    )}
                  >
                    <p className="font-mono text-[13px] tabular-nums text-[var(--bright)]">
                      {b.time}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] tabular-nums text-[var(--text-dim)]">
                      {b.end}
                    </p>
                    {status === "now" && (
                      <p className="cursor mt-2 font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--bright)]">
                        {t("agenda.now")}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-mono text-[14px] leading-snug text-[var(--text)]">
                          {b.description}
                        </h2>
                        {b.mono && (
                          <code className="mt-1.5 inline-block border border-[var(--line)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--bright)]">
                            {b.mono}
                          </code>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Tag>{t(`kinds.${b.kind}`)}</Tag>
                          <span className="font-mono text-[11px] text-[var(--text-dim)]">
                            {t(`places.${b.place}`)}
                          </span>
                          {b.mandatory && (
                            <Tag strong>{t("agenda.mandatory")}</Tag>
                          )}
                          {b.audience
                            .filter((a) => a !== "hackers")
                            .map((a) => (
                              <Tag key={a}>+ {t(`audience.${a}`)}</Tag>
                            ))}
                        </div>
                      </div>
                      <AgendaToggle
                        time={b.time}
                        saved={saved.has(b.time)}
                        saveLabel={t("agenda.save")}
                        savedLabel={t("agenda.unsave")}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <p className="mt-4 font-mono text-[11px] text-[var(--text-dim)]">
        {t("agenda.footer", {
          shown: blocks.length,
          total: all.length,
          // La zona ya no es un literal en el copy: Guatemala y El Salvador no
          // están en America/Bogota y el pie se lo afirmaba a la cara.
          zone: `${cityTimeZone(participant.city)} (${cityClockLabel(participant.city)})`,
        })}
      </p>
    </>
  );
}
