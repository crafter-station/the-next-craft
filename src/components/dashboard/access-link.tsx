"use client";

import { useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { Link } from "@/i18n/navigation";

/**
 * Entrada para los acreditados. Dos estados, y los dos visibles:
 *
 * - sin sesión → «Entrar», al Badge Studio, que es donde se inicia sesión
 * - con sesión → «Dashboard», al panel
 *
 * Antes esto solo se pintaba con sesión, y era el huevo y la gallina: para
 * conseguir sesión hay que llegar a /badge, y a /badge solo se llegaba desde
 * un enlace enterrado en la galería.
 *
 * La sesión se comprueba en cliente para que la landing siga siendo estática.
 */
export function AccessLink({ className }: { className?: string }) {
  const { data: session, isPending } = authClient.useSession();
  const t = useTranslations("dashboard.access");

  const signedIn = Boolean(session);

  return (
    <Link
      href={signedIn ? "/dashboard" : "/badge"}
      className={cn(
        "font-mono text-[11px] leading-[1.4] tracking-[0.14em] uppercase",
        className,
      )}
      // Mientras resuelve la sesión mostramos «Entrar»: es el caso de la
      // mayoría y evita que el enlace baile al hidratar.
      aria-busy={isPending || undefined}
    >
      {signedIn ? t("dashboard") : t("signIn")}
    </Link>
  );
}
