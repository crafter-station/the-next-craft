"use client";

import { useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { Link } from "@/i18n/navigation";

/**
 * Entrada al panel del hacker, solo para quien tiene sesión.
 *
 * Comprueba la sesión en el cliente a propósito: hacerlo en el servidor
 * convertía la landing en dinámica, y esa página es de marketing y debe
 * seguir siendo estática. Quien entre sin acreditación se topa con la puerta
 * del propio panel, que ya lo explica.
 */
export function DashboardNavLink({ className }: { className?: string }) {
  const { data: session, isPending } = authClient.useSession();
  const t = useTranslations("dashboard.nav");

  if (isPending || !session) return null;

  return (
    <Link
      href="/dashboard"
      className={cn(
        "nav-link font-mono text-[11px] leading-[1.4] tracking-[0.14em] uppercase",
        className,
      )}
    >
      {t("overview")}
    </Link>
  );
}
