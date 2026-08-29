"use client";

import { useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import type { CityKey } from "@/lib/cities";
import type { TrackKey } from "@/lib/db/schema-types";
import {
  createProjectAction,
  updateProjectAction,
} from "@/lib/judging/actions";
import type { Project } from "@/lib/judging/projects";
import { cn } from "@/lib/utils";

import {
  Empty,
  keyClass,
  Panel,
  PanelHead,
  Tag,
} from "@/components/dashboard/kit";

import { useRouter } from "@/i18n/navigation";

const fieldClass =
  "w-full border border-[var(--line)] bg-[var(--void)] px-2.5 py-2 font-mono text-[13px] text-[var(--text)] placeholder:text-[var(--line-strong)] focus:border-[var(--line-strong)] focus:outline-none";

const cellInputClass =
  "w-full border border-transparent bg-transparent px-2 py-1 font-mono text-[12px] text-[var(--text)] hover:border-[var(--line)] focus:border-[var(--line-strong)] focus:bg-[var(--void)] focus:outline-none";

export type ProjectManagerProps = {
  projects: Project[];
  cities: CityKey[];
  tracks: TrackKey[];
};

/**
 * La lista de proyectos que se califican, escribible por el staff.
 *
 * Está pensada para usarse como se usa una hoja de cálculo: se escribe la fila,
 * se corrige en sitio, se sigue. Por eso los campos de la tabla guardan al
 * salir del campo y no detrás de un botón «editar» — con veinte proyectos y la
 * sala llena, un modal por fila es el camino largo.
 *
 * Un proyecto sin sede o sin track se marca en rojo: no lo ve ningún mentor, y
 * es mejor descubrirlo aquí que cuando el mentor no encuentra al equipo.
 */
export function ProjectManager({
  projects,
  cities,
  tracks,
}: ProjectManagerProps) {
  const t = useTranslations("admin.projects");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [city, setCity] = useState<CityKey>(cities[0]);
  const [track, setTrack] = useState<TrackKey>(tracks[0]);
  const [table, setTable] = useState("");

  function add() {
    setError(null);
    startTransition(async () => {
      const result = await createProjectAction({
        name,
        city,
        track,
        tableNumber: table || null,
        demoUrl: null,
      });
      if (result.ok) {
        setName("");
        setTable("");
        router.refresh();
        return;
      }
      setError(t(`errors.${result.error}`));
    });
  }

  function patch(
    teamId: string,
    input: Parameters<typeof updateProjectAction>[1],
  ) {
    startTransition(async () => {
      await updateProjectAction(teamId, input);
      router.refresh();
    });
  }

  const incomplete = projects.filter((p) => p.incomplete).length;

  return (
    <Panel className="mb-5">
      <PanelHead
        n={15}
        label={t("label")}
        title={t("title")}
        aside={
          <Tag strong={incomplete === 0}>
            {incomplete === 0
              ? t("allReady", { count: projects.length })
              : t("someIncomplete", { count: incomplete })}
          </Tag>
        }
      />

      <div className="grid gap-3 border-b border-[var(--line)] px-4 py-4 sm:grid-cols-[2fr_1fr_1fr_auto_auto] sm:items-end">
        <label className="block">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
            {t("fieldName")}
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("fieldNamePlaceholder")}
            className={cn(fieldClass, "mt-2")}
          />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
            {t("fieldCity")}
          </span>
          <select
            value={city}
            onChange={(event) => setCity(event.target.value as CityKey)}
            className={cn(fieldClass, "mt-2")}
          >
            {cities.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
            {t("fieldTrack")}
          </span>
          <select
            value={track}
            onChange={(event) => setTrack(event.target.value as TrackKey)}
            className={cn(fieldClass, "mt-2")}
          >
            {tracks.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:w-20">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
            {t("fieldTable")}
          </span>
          <input
            value={table}
            onChange={(event) => setTable(event.target.value)}
            className={cn(fieldClass, "mt-2")}
          />
        </label>
        <button
          type="button"
          disabled={pending || name.trim().length < 2}
          onClick={add}
          className={keyClass}
        >
          {t("add")}
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

      {projects.length === 0 ? (
        <Empty>{t("empty")}</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse font-mono text-[12px]">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] tracking-[0.12em] uppercase text-[var(--text-dim)]">
                <th className="px-4 py-2.5 text-left">{t("colName")}</th>
                <th className="px-2 py-2.5 text-left">{t("colCity")}</th>
                <th className="px-2 py-2.5 text-left">{t("colTrack")}</th>
                <th className="px-2 py-2.5 text-left">{t("colTable")}</th>
                <th className="px-4 py-2.5 text-right">{t("colScores")}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className={cn(
                    "border-b border-[var(--line)] last:border-b-0",
                    project.incomplete && "bg-[var(--destructive)]/5",
                  )}
                >
                  <td className="px-4 py-2 text-left">
                    <span className="text-[var(--text)]">{project.name}</span>
                    {project.incomplete && (
                      <Tag className="ml-2 border-[var(--destructive)]/60 text-[var(--destructive)]">
                        {t("notScorable")}
                      </Tag>
                    )}
                    {project.finalist && (
                      <Tag className="ml-2">{t("finalist")}</Tag>
                    )}
                  </td>
                  <td className="px-2 py-2 text-left">
                    <select
                      value={project.city ?? ""}
                      disabled={pending}
                      onChange={(event) =>
                        patch(project.id, {
                          city: (event.target.value || null) as CityKey | null,
                        })
                      }
                      className={cellInputClass}
                    >
                      <option value="">—</option>
                      {cities.map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 text-left">
                    <select
                      value={project.track ?? ""}
                      disabled={pending}
                      onChange={(event) =>
                        patch(project.id, {
                          track: (event.target.value ||
                            null) as TrackKey | null,
                        })
                      }
                      className={cellInputClass}
                    >
                      <option value="">—</option>
                      {tracks.map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 text-left">
                    <input
                      defaultValue={project.tableNumber ?? ""}
                      disabled={pending}
                      // Guarda al salir del campo: escribir, tabular, seguir.
                      onBlur={(event) => {
                        const next = event.target.value.trim() || null;
                        if (next === (project.tableNumber ?? null)) return;
                        patch(project.id, { tableNumber: next });
                      }}
                      className={cn(cellInputClass, "w-16")}
                    />
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-[var(--text-dim)]">
                    {project.scores}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="border-t border-[var(--line)] px-4 py-3 font-mono text-[11px] leading-relaxed text-[var(--text-dim)]">
        {t("note")}
      </p>
    </Panel>
  );
}
