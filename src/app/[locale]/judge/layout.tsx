import type { Metadata } from "next";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { currentPanelist } from "@/lib/judging/state";

import { Basic, Pixel, Tag } from "@/components/dashboard/kit";
import { CodeGate } from "@/components/judging/code-gate";
import { SignOut } from "@/components/judging/sign-out";

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
 * dashboard solo entra quien está inscrito.
 *
 * Su puerta tampoco es el OTP al correo. Ese fallaba en silencio: el código
 * solo se envía a direcciones dadas de alta, así que quien tecleaba otra no
 * recibía nada ni sabía por qué. Aquí el staff dicta un código y se entra.
 */
export default async function JudgeLayout({
  children,
  params,
}: LayoutProps<"/[locale]/judge">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("judging");
  const panelist = await currentPanelist();
  if (!panelist) return <CodeGate />;

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
            <SignOut />
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
