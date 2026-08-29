"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { Link, usePathname } from "@/i18n/navigation";

const LINKS = [
  { key: "staff", href: "/admin/staff" },
  { key: "perks", href: "/admin/perks" },
  { key: "judging", href: "/admin/judging" },
] as const;

export function AdminNav() {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-[1140px] gap-1 border-t border-[var(--line)] px-4 py-2 sm:px-6">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.key}
            href={link.href}
            className={cn(
              "border px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors",
              active
                ? "border-[var(--bone)] bg-[var(--bone)] text-[var(--void)]"
                : "border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--bright)]",
            )}
          >
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
