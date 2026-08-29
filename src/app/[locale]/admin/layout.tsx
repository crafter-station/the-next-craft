import type { Metadata } from "next";
import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { currentStaffEmail } from "@/lib/dashboard/staff";

import { AdminNav } from "@/components/admin/admin-nav";
import { Basic, Empty, Panel, Pixel, Tag } from "@/components/dashboard/kit";

import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: LayoutProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const session = await auth.api.getSession({ headers: await headers() });
  const staffEmail = session?.user.email ? await currentStaffEmail() : null;

  if (!session) {
    return (
      <Gate title={t("gate.title")} body={t("gate.body")} cta={t("gate.cta")} />
    );
  }

  if (!staffEmail) {
    return (
      <main
        id="main-content"
        className="mx-auto max-w-[720px] px-4 py-16 sm:px-6"
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
          <div className="min-w-0">
            <Basic n={1}>ADMIN</Basic>
            <Pixel size="sm" className="mt-1">
              {t("shell.title")}
            </Pixel>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Tag strong>{staffEmail}</Tag>
            <Link
              href="/admin/staff"
              className="font-mono text-[11px] text-[var(--text-dim)] hover:text-[var(--bright)]"
            >
              {t("shell.home")} →
            </Link>
          </div>
        </div>
        <AdminNav />
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

function Gate({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: string;
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
        <Link
          href="/badge"
          className="keycap mt-6 inline-block px-4 py-2.5 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase"
        >
          {cta} →
        </Link>
      </div>
    </main>
  );
}
