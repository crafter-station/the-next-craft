"use client";

import { useMemo, useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import { forgetDevice, identifyAs } from "@/lib/judging/actions";
import { cn } from "@/lib/utils";

import { Basic, Empty, Panel, Pixel } from "@/components/dashboard/kit";

import { useRouter } from "@/i18n/navigation";

type Person = {
  id: string;
  fullName: string;
  role: "mentor" | "judge";
  city: string | null;
};

/**
 * «¿Quién eres?» — el segundo paso, y el que sostiene todo el cálculo.
 *
 * Con un código común la app no sabría de quién son las notas, y corregir que
 * un mentor puntúe más duro que otro exige saberlo. Sin este paso, el panel
 * entero sería una sola identidad y el ranking volvería a ser una suma cruda.
 *
 * Se pide teclear para filtrar en vez de mostrar una lista larga: en cinco
 * sedes hay demasiados nombres para buscar el propio con el pulgar, y elegir
 * mal es peor que tardar.
 */
export function WhoAreYou({ people }: { people: Person[] }) {
  const t = useTranslations("judging.who");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const needle = query
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
    if (!needle) return people;
    return people.filter((person) =>
      person.fullName
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .includes(needle),
    );
  }, [people, query]);

  function pick(id: string) {
    startTransition(async () => {
      const result = await identifyAs(id);
      if (result.ok) router.refresh();
    });
  }

  return (
    <main
      id="main-content"
      className="mx-auto max-w-[560px] px-4 py-16 sm:px-6"
    >
      <Panel className="scanlines px-6 py-8">
        <Basic n={20}>IDENTIDAD</Basic>
        <Pixel size="lg" className="mt-3">
          {t("title")}
        </Pixel>
        <p className="mt-4 font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
          {t("body")}
        </p>

        {people.length > 8 && (
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search")}
            className="mt-6 w-full border border-[var(--line)] bg-[var(--void)] px-3 py-2.5 font-mono text-[13px] text-[var(--text)] placeholder:text-[var(--line-strong)] focus:border-[var(--line-strong)] focus:outline-none"
          />
        )}

        {people.length === 0 ? (
          <Empty>{t("empty")}</Empty>
        ) : (
          <ul className="mt-5 border-t border-[var(--line)]">
            {matches.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => pick(person.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 border-b border-[var(--line)] px-1 py-3.5 text-left transition-colors",
                    "hover:bg-[var(--void)] focus-visible:bg-[var(--void)] focus-visible:outline-none disabled:opacity-40",
                  )}
                >
                  <span className="min-w-0 truncate font-mono text-[14px] text-[var(--text)]">
                    {person.fullName}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--text-dim)]">
                    {person.role === "mentor"
                      ? (person.city ?? t("mentor"))
                      : t("judge")}
                  </span>
                </button>
              </li>
            ))}
            {matches.length === 0 && (
              <li className="px-1 py-4 font-mono text-[12px] text-[var(--text-dim)]">
                {t("noMatch")}
              </li>
            )}
          </ul>
        )}

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await forgetDevice();
              router.refresh();
            })
          }
          className="mt-6 font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--text-dim)] underline underline-offset-4 hover:text-[var(--bright)]"
        >
          {t("notMe")}
        </button>
      </Panel>
    </main>
  );
}
