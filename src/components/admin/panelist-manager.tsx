"use client";

import { useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import type { CityKey } from "@/lib/cities";
import {
  addPanelist,
  regenerateCode,
  revokePanelist,
} from "@/lib/judging/actions";
import { cn } from "@/lib/utils";

import {
  Cell,
  Empty,
  keyClass,
  Panel,
  PanelHead,
  Table,
  Tag,
} from "@/components/dashboard/kit";

import { useRouter } from "@/i18n/navigation";

type PanelistRow = {
  id: string;
  email: string;
  fullName: string;
  role: "mentor" | "judge";
  city: CityKey | null;
  /** Lo que se le dicta para entrar. Ver `lib/judging/access.ts`. */
  accessCode: string;
  revokedAt: Date | null;
  scored: number;
};

const inputClass =
  "w-full border border-[var(--line)] bg-[var(--void)] px-3 py-2 font-mono text-[13px] text-[var(--text)] placeholder:text-[var(--line-strong)] focus:border-[var(--line-strong)] focus:outline-none";

/**
 * Alta y baja del panel.
 *
 * Dar de alta es lo que permite recibir el código de acceso: mentores y
 * jurados no están en Luma ni llevan correo de la organización, así que sin
 * pasar por aquí no tienen forma de entrar a calificar.
 *
 * La baja no borra. Los puntajes que esa persona ya emitió siguen contando:
 * calificó lo que vio, y quitarlos movería el resultado de sus equipos.
 */
export function PanelistManager({
  panelists,
  cities,
}: {
  panelists: PanelistRow[];
  cities: string[];
}) {
  const t = useTranslations("admin.judging");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"mentor" | "judge">("mentor");
  const [city, setCity] = useState<string>(cities[0] ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addPanelist({
        email,
        fullName,
        role,
        city: role === "mentor" ? (city as CityKey) : null,
      });
      if (result.ok) {
        setEmail("");
        setFullName("");
        router.refresh();
        return;
      }
      setError(t(`errors.${result.error}`));
    });
  }

  return (
    <Panel>
      <PanelHead n={40} label={t("rosterLabel")} title={t("rosterTitle")} />

      <div className="grid gap-3 border-b border-[var(--line)] px-4 py-4 sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-end">
        <label className="block">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
            {t("fieldName")}
          </span>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={cn(inputClass, "mt-2")}
            placeholder={t("fieldNamePlaceholder")}
          />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
            {t("fieldEmail")}
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={cn(inputClass, "mt-2")}
            placeholder="nombre@ejemplo.com"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
            {t("fieldRole")}
          </span>
          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value as "mentor" | "judge")
            }
            className={cn(inputClass, "mt-2")}
          >
            <option value="mentor">{t("roleMentor")}</option>
            <option value="judge">{t("roleJudge")}</option>
          </select>
        </label>
        <label className={cn("block", role === "judge" && "opacity-40")}>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
            {t("fieldCity")}
          </span>
          <select
            value={city}
            disabled={role === "judge"}
            onChange={(event) => setCity(event.target.value)}
            className={cn(inputClass, "mt-2")}
          >
            {cities.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={pending || !email.trim()}
          onClick={submit}
          className={keyClass}
        >
          {t("rosterAdd")}
        </button>
      </div>

      {error && (
        <p
          role="status"
          className="border-b border-[var(--line)] px-4 py-2.5 font-mono text-[12px] text-[var(--destructive)]"
        >
          {error}
        </p>
      )}

      <p className="border-b border-[var(--line)] px-4 py-2.5 font-mono text-[11px] leading-relaxed text-[var(--text-dim)]">
        {t("rosterNote")}
      </p>

      {panelists.length === 0 ? (
        <Empty>{t("rosterEmpty")}</Empty>
      ) : (
        <Table className="sm:grid sm:grid-cols-2">
          {panelists.map((row) => (
            <Cell key={row.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate font-mono text-[13px]",
                      row.revokedAt
                        ? "text-[var(--line-strong)] line-through"
                        : "text-[var(--text)]",
                    )}
                  >
                    {row.fullName}
                  </p>
                  <p className="mt-1 truncate font-mono text-[11px] text-[var(--text-dim)]">
                    {row.email}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Tag>
                    {row.role === "mentor"
                      ? `${t("roleMentor")} · ${row.city ?? "—"}`
                      : t("roleJudge")}
                  </Tag>
                  <span className="font-mono text-[10px] tabular-nums text-[var(--text-dim)]">
                    {t("rosterScored", { count: row.scored })}
                  </span>
                </div>
              </div>
              {!row.revokedAt && (
                <>
                  {/* El código es lo que el staff lee en voz alta, así que va
                      grande y con el guion puesto, no escondido en un menú. */}
                  <div className="mt-3 flex items-center justify-between gap-3 border border-[var(--line)] bg-[var(--void)] px-3 py-2">
                    <code className="font-mono text-[16px] tracking-[0.18em] text-[var(--bright)]">
                      {row.accessCode.slice(0, 4)}-{row.accessCode.slice(4)}
                    </code>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        navigator.clipboard?.writeText(row.accessCode)
                      }
                      className="shrink-0 font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--text-dim)] hover:text-[var(--bright)]"
                    >
                      {t("rosterCopy")}
                    </button>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-4">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await regenerateCode(row.id);
                          router.refresh();
                        })
                      }
                      className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--text-dim)] underline underline-offset-4 hover:text-[var(--bright)]"
                    >
                      {t("rosterRegenerate")}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await revokePanelist(row.id);
                          router.refresh();
                        })
                      }
                      className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--text-dim)] underline underline-offset-4 hover:text-[var(--destructive)]"
                    >
                      {t("rosterRevoke")}
                    </button>
                  </div>
                </>
              )}
            </Cell>
          ))}
        </Table>
      )}
    </Panel>
  );
}
