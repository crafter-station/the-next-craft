import type { Metadata } from "next";
import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { PARTNERS, SUBMISSION_DEADLINE } from "@/lib/dashboard/content";
import { currentStaffEmail } from "@/lib/dashboard/staff";
import {
  findParticipantByUserId,
  findTeamForParticipant,
} from "@/lib/dashboard/state";
import { formatClock, resolveNow } from "@/lib/dashboard/time";

import { Countdown } from "@/components/dashboard/countdown";
import { Basic, keyClass, Pixel, Tag } from "@/components/dashboard/kit";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Tu panel de The Next Craft.",
  robots: { index: false, follow: false },
};

/** El dashboard depende de la sesión y del estado del día: nunca estático. */
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
  params,
}: LayoutProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <Gate
        title={t("gate.title")}
        body={t("gate.body")}
        cta={t("gate.cta")}
        href="/badge"
      />
    );
  }

  const participant = await findParticipantByUserId(session.user.id);
  if (!participant) {
    return (
      <Gate
        title={t("gate.noParticipantTitle")}
        body={t("gate.noParticipantBody")}
        cta={t("gate.cta")}
        href="/badge"
      />
    );
  }

  const [team, staffEmail] = await Promise.all([
    findTeamForParticipant(participant.id),
    currentStaffEmail(),
  ]);
  const { now, anchored } = resolveNow();

  return (
    <div className="lg:flex">
      <DashboardSidebar
        name={participant.fullName}
        tableNumber={team?.tableNumber ?? null}
        partners={PARTNERS.map((p) => ({ key: p.key, name: p.name }))}
        isStaff={Boolean(staffEmail)}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--void)]/95 backdrop-blur-[2px]">
          <div className="flex h-[56px] items-center justify-between gap-4 px-4 sm:px-6">
            <span className="hidden truncate font-mono text-[11px] text-[var(--text-dim)] md:block">
              {t("shell.hub")} {(participant.city ?? "").toUpperCase()}
            </span>
            <div className="ml-auto flex shrink-0 items-center gap-4">
              {anchored && <Tag>{t("shell.demoClock")}</Tag>}
              <Countdown
                deadlineIso={new Date(SUBMISSION_DEADLINE).toISOString()}
                fallbackClock={formatClock(now, locale)}
                anchored={anchored}
                freezeLabel={t("shell.toFreeze")}
              />
            </div>
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto max-w-[1140px] px-4 py-6 sm:px-6 sm:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function Gate({
  title,
  body,
  cta,
  href,
}: {
  title: string;
  body: string;
  cta: string;
  href: "/badge";
}) {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-svh max-w-[560px] flex-col justify-center px-5 py-16"
    >
      <div className="scanlines border border-[var(--line)] bg-[var(--screen-dim)] px-6 py-8">
        <Basic n={10}>ACCESS</Basic>
        <Pixel size="lg" className="mt-3">
          {title}
        </Pixel>
        <p className="mt-4 font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
          {body}
        </p>
        <Link href={href} className={`${keyClass} mt-6`}>
          {cta} →
        </Link>
      </div>
    </main>
  );
}
