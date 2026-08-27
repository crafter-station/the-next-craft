import type { Metadata } from "next";
import { headers } from "next/headers";

import { setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { withBadgeRealtimeAccess } from "@/lib/badge/realtime";
import { getBadgeStudioState } from "@/lib/badge/state";

import { BadgeStudio } from "@/components/badge/badge-studio";
import { AccessLink } from "@/components/dashboard/access-link";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "Badge Studio",
  description: "Genera tu badge oficial de The Next Craft.",
  robots: { index: false, follow: false },
};

export default async function BadgePage({
  params,
}: PageProps<"/[locale]/badge">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth.api.getSession({ headers: await headers() });
  const initialState = session
    ? await withBadgeRealtimeAccess(await getBadgeStudioState(session.user.id))
    : null;
  const studioKey = session
    ? `${session.user.id}:${initialState?.stage}:${initialState && "profile" in initialState ? initialState.profile.updatedAt : ""}`
    : "anonymous";

  return (
    <main
      id="main-content"
      className="relative min-h-screen overflow-x-hidden px-5 py-8 md:px-10 md:py-12"
    >
      <div className="grid-bg" aria-hidden="true" />
      {/* Quien ya está acreditado tiene su panel del día del evento aquí. */}
      <div className="relative mb-6 flex justify-end">
        <AccessLink className="keycap-ghost px-3 py-2" />
      </div>
      <QueryProvider>
        <BadgeStudio
          key={studioKey}
          locale={locale === "en" ? "en" : "es"}
          initialSession={session}
          initialState={initialState}
        />
      </QueryProvider>
    </main>
  );
}
