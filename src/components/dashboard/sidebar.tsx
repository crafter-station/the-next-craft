"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { Link, usePathname } from "@/i18n/navigation";
import { DASHBOARD_NAV } from "./nav";

const GROUPS = [
  { key: "event", labelKey: "groupEvent", n: 10 },
  { key: "resources", labelKey: "groupResources", n: 20 },
  { key: "staff", labelKey: "groupStaff", n: 30 },
] as const;

export function DashboardSidebar({
  name,
  tableNumber,
  partners,
  isStaff,
}: {
  name: string;
  tableNumber: string | null;
  partners: { key: string; name: string }[];
  isStaff: boolean;
}) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(
    pathname.startsWith("/dashboard/credits"),
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3 lg:hidden">
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="font-[family-name:var(--font-script)] text-[17px] lowercase text-[var(--bright)]"
        >
          the next craft
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="border border-[var(--line)] px-2.5 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--bright)]"
        >
          {open ? t("close") : t("menu")}
        </button>
      </div>

      <aside
        className={cn(
          "border-[var(--line)] lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-[236px] lg:shrink-0 lg:flex-col lg:border-r",
          open ? "block border-b" : "hidden lg:flex",
        )}
      >
        <div className="hidden h-[56px] items-center border-b border-[var(--line)] px-4 lg:flex">
          <Link
            href="/dashboard"
            className="font-[family-name:var(--font-script)] pt-2 text-[17px] leading-none lowercase text-[var(--bright)]"
          >
            the next craft
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {GROUPS.filter((group) => group.key !== "staff" || isStaff).map(
            (group) => (
              <div key={group.key} className="mb-5">
                <p className="px-1.5 pb-2.5 font-mono text-[11px] leading-none tracking-[0.14em] uppercase text-[var(--text-dim)]">
                  <span className="text-[var(--bright)]">{group.n}</span>{" "}
                  {t(group.labelKey)}
                </p>
                <ul>
                  {DASHBOARD_NAV.filter((n) => n.group === group.key).map(
                    (item) => {
                      const active = pathname === item.href;
                      const isCredits = item.key === "credits";
                      return (
                        <li key={item.key}>
                          <div className="flex items-stretch">
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex-1 border-l-2 px-2.5 py-2 font-mono text-[13px] transition-colors",
                                active
                                  ? "border-[var(--bright)] bg-[var(--screen-dim)] text-[var(--bright)]"
                                  : "border-transparent text-[var(--text-dim)] hover:border-[var(--line)] hover:text-[var(--text)]",
                              )}
                            >
                              {t(item.key)}
                            </Link>
                            {isCredits && (
                              <button
                                type="button"
                                onClick={() => setCreditsOpen((v) => !v)}
                                aria-expanded={creditsOpen}
                                aria-label={t("credits")}
                                className="px-2 font-mono text-[11px] text-[var(--text-dim)] hover:text-[var(--bright)]"
                              >
                                {creditsOpen ? "−" : "+"}
                              </button>
                            )}
                          </div>
                          {isCredits && creditsOpen && (
                            <ul className="mb-1 ml-4 border-l border-[var(--line)]">
                              {partners.map((p) => {
                                const href = `/dashboard/credits/${p.key}`;
                                return (
                                  <li key={p.key}>
                                    <Link
                                      href={href}
                                      onClick={() => setOpen(false)}
                                      className={cn(
                                        "block px-2.5 py-1.5 font-mono text-[12px] transition-colors",
                                        pathname === href
                                          ? "text-[var(--bright)]"
                                          : "text-[var(--text-dim)] hover:text-[var(--text)]",
                                      )}
                                    >
                                      {p.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    },
                  )}
                </ul>
              </div>
            ),
          )}
        </nav>

        <div className="border-t border-[var(--line)] p-3">
          <div className="border border-[var(--line)] px-3 py-2.5">
            <p className="font-mono text-[12px] text-[var(--text)]">{name}</p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
              {tableNumber ? `MESA ${tableNumber}` : "HACKER"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
