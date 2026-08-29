import type { Metadata } from "next";
import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { currentPanelist } from "@/lib/judging/state";

import { Basic, Empty, Panel, Pixel, Tag } from "@/components/dashboard/kit";

import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Panel de calificación",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * El área de mentores y jurados.
 *
 * Vive fuera de `/dashboard` a propósito: aquel shell es del hacker —barra
 * lateral con tracks, agenda y cuenta atrás para entregar— y su puerta exige
 * ser participante acreditado en Luma. Un mentor no es participante, y
 * ablandar esa puerta para dejarlo pasar rompería la garantía de que al
 * dashboard solo entra quien está inscrito. Así que el panel tiene su propia
 * puerta, contra `dashboard_panelists`.
 */
export default async function JudgeLayout({
  children,
  params,
}: LayoutProps<"/[locale]/judge">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("judging");
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <main
        id="main-content"
        className="mx-auto max-w-[640px] px-4 py-16 sm:px-6"
      >
        <Panel className="scanlines px-6 py-8">
          <Basic n={10}>ACCESO</Basic>
          <Pixel size="lg" className="mt-3">
            {t("gate.title")}
          </Pixel>
          <p className="mt-4 font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
            {t("gate.body")}
          </p>
          <Link
            href="/badge"
            className="mt-6 inline-block font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--bright)] underline underline-offset-4"
          >
            {t("gate.cta")} →
          </Link>
        </Panel>
      </main>
    );
  }

  const panelist = await currentPanelist();
  if (!panelist) {
    return (
      <main
        id="main-content"
        className="mx-auto max-w-[640px] px-4 py-16 sm:px-6"
      >
        <Panel className="scanlines px-6 py-8">
          <Empty>{t("gate.denied")}</Empty>
        </Panel>
      </main>
    );
  }

  return (
    <div className="min-h-svh bg-[var(--void)]">
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex h-[56px] max-w-[1140px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/judge" className="min-w-0">
            <Basic n={1}>{t(`role.${panelist.role}`)}</Basic>
            <Pixel size="sm" className="mt-1 truncate">
              {t("shell.title")}
            </Pixel>
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            {panelist.city && (
              <Tag>{t("shell.hub", { city: panelist.city.toUpperCase() })}</Tag>
            )}
            <Tag strong>{panelist.fullName}</Tag>
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
  );
}
