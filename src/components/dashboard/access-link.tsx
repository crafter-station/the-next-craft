"use client";

import { useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";
import { AUTH_CONTINUE_PATH } from "@/lib/staff/constants";
import { cn } from "@/lib/utils";

import { Link } from "@/i18n/navigation";

/**
 * Entrada para acreditados y staff. Sin sesión → Badge Studio (login).
 * Con sesión → el servidor elige destino en /auth/continue.
 */
export function AccessLink({ className }: { className?: string }) {
  const { data: session, isPending } = authClient.useSession();
  const t = useTranslations("dashboard.access");

  const signedIn = Boolean(session);
  const href = signedIn ? AUTH_CONTINUE_PATH : "/badge";

  return (
    <Link
      href={href}
      className={cn(
        "font-mono text-[11px] leading-[1.4] tracking-[0.14em] uppercase",
        className,
      )}
      aria-busy={isPending || undefined}
    >
      {signedIn ? t("continue") : t("signIn")}
    </Link>
  );
}
