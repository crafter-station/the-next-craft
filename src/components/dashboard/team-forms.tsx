"use client";

import { useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import {
  createTeam,
  joinTeam,
  leaveTeam,
  updateTeamDetails,
} from "@/lib/dashboard/team-actions";
import { MAX_TEAM_SIZE } from "@/lib/dashboard/team-limits";

import { Basic, keyClass, keyGhostClass, Panel, PanelHead } from "./kit";

function useAction() {
  const t = useTranslations("dashboard.team.errors");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok && res.error) setError(t(res.error));
    });
  };

  return { error, pending, run };
}

/** Sin equipo: crear uno o entrar con el código de un compañero. */
export function TeamOnboarding() {
  const t = useTranslations("dashboard.team");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const create = useAction();
  const join = useAction();

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <Panel screen>
        <PanelHead n={31} label={t("createLabel")} title={t("createTitle")} />
        <div className="px-4 py-4">
          <p className="font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
            {t("createBody")}
          </p>
          <label
            htmlFor="team-name"
            className="mt-4 block font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]"
          >
            {t("nameLabel")}
          </label>
          <input
            id="team-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={48}
            placeholder={t("namePlaceholder")}
            className="mt-2 w-full border border-[var(--line)] bg-[var(--void)] px-3 py-2.5 font-mono text-[13px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:border-[var(--bright)] focus:outline-none"
          />
          {create.error && (
            <p className="mt-3 font-mono text-[11px] text-[var(--bright)]">
              {create.error}
            </p>
          )}
          <button
            type="button"
            className={`${keyClass} mt-4 w-full`}
            disabled={create.pending || name.trim().length < 2}
            onClick={() => create.run(() => createTeam(name))}
          >
            {t("createCta")} →
          </button>
        </div>
      </Panel>

      <Panel>
        <PanelHead n={32} label={t("joinLabel")} title={t("joinTitle")} />
        <div className="px-4 py-4">
          <p className="font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
            {t("joinBody")}
          </p>
          <label
            htmlFor="team-code"
            className="mt-4 block font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]"
          >
            {t("codeLabel")}
          </label>
          <input
            id="team-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            placeholder="ABC234"
            autoCapitalize="characters"
            className="mt-2 w-full border border-[var(--line)] bg-[var(--void)] px-3 py-2.5 font-mono text-[18px] tracking-[0.3em] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:border-[var(--bright)] focus:outline-none"
          />
          {join.error && (
            <p className="mt-3 font-mono text-[11px] text-[var(--bright)]">
              {join.error}
            </p>
          )}
          <button
            type="button"
            className={`${keyGhostClass} mt-4 w-full`}
            disabled={join.pending || code.trim().length < 4}
            onClick={() => join.run(() => joinTeam(code))}
          >
            {t("joinCta")} →
          </button>
        </div>
      </Panel>
    </div>
  );
}

/** El código, para dictarlo en voz alta. */
export function JoinCode({ code }: { code: string }) {
  const t = useTranslations("dashboard.team");
  const [copied, setCopied] = useState(false);

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <Basic n={34}>{t("shareLabel")}</Basic>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch {
              setCopied(false);
            }
          }}
          className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--text-dim)] hover:text-[var(--bright)]"
        >
          {copied ? t("copied") : t("copy")}
        </button>
      </div>
      <p className="mt-3 border border-dashed border-[var(--line)] px-4 py-4 text-center font-mono text-[30px] tracking-[0.34em] text-[var(--bright)]">
        {code}
      </p>
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-[var(--text-dim)]">
        {t("shareBody", { max: MAX_TEAM_SIZE })}
      </p>
    </div>
  );
}

/** Nombre, pitch y links: lo que el jurado mira en la entrega. */
export function TeamDetailsForm({
  name: initialName,
  pitch: initialPitch,
  repoUrl: initialRepo,
  demoUrl: initialDemo,
}: {
  name: string;
  pitch: string;
  repoUrl: string;
  demoUrl: string;
}) {
  const t = useTranslations("dashboard.team");
  const [name, setName] = useState(initialName);
  const [pitch, setPitch] = useState(initialPitch);
  const [repoUrl, setRepoUrl] = useState(initialRepo);
  const [demoUrl, setDemoUrl] = useState(initialDemo);
  const [saved, setSaved] = useState(false);
  const { error, pending, run } = useAction();

  const dirty =
    name !== initialName ||
    pitch !== initialPitch ||
    repoUrl !== initialRepo ||
    demoUrl !== initialDemo;

  const field =
    "mt-2 w-full border border-[var(--line)] bg-[var(--void)] px-3 py-2.5 font-mono text-[13px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:border-[var(--bright)] focus:outline-none";
  const label =
    "block font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]";

  return (
    <div className="px-4 py-4">
      <label htmlFor="detail-name" className={label}>
        {t("nameLabel")}
      </label>
      <input
        id="detail-name"
        value={name}
        maxLength={48}
        onChange={(e) => {
          setName(e.target.value);
          setSaved(false);
        }}
        className={field}
      />

      <label htmlFor="detail-pitch" className={`${label} mt-4`}>
        {t("pitchLabel")}
      </label>
      <textarea
        id="detail-pitch"
        value={pitch}
        rows={3}
        maxLength={280}
        placeholder={t("pitchPlaceholder")}
        onChange={(e) => {
          setPitch(e.target.value);
          setSaved(false);
        }}
        className={`${field} resize-none`}
      />

      <label htmlFor="detail-repo" className={`${label} mt-4`}>
        {t("repoLabel")}
      </label>
      <input
        id="detail-repo"
        value={repoUrl}
        placeholder="https://github.com/..."
        onChange={(e) => {
          setRepoUrl(e.target.value);
          setSaved(false);
        }}
        className={field}
      />

      <label htmlFor="detail-demo" className={`${label} mt-4`}>
        {t("demoLabel")}
      </label>
      <input
        id="detail-demo"
        value={demoUrl}
        placeholder="https://..."
        onChange={(e) => {
          setDemoUrl(e.target.value);
          setSaved(false);
        }}
        className={field}
      />

      {error && (
        <p className="mt-3 font-mono text-[11px] text-[var(--bright)]">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] text-[var(--text-dim)]">
          {saved && !dirty ? t("saved") : dirty ? t("unsaved") : t("clean")}
        </span>
        <button
          type="button"
          className={keyClass}
          disabled={pending || !dirty}
          onClick={() => {
            run(async () => {
              const res = await updateTeamDetails({
                name,
                pitch,
                repoUrl,
                demoUrl,
              });
              if (res.ok) setSaved(true);
              return res;
            });
          }}
        >
          {t("save")} →
        </button>
      </div>
    </div>
  );
}

export function LeaveTeamButton() {
  const t = useTranslations("dashboard.team");
  const { error, pending, run } = useAction();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <div className="border-t border-[var(--line)] px-4 py-3.5">
        <button
          type="button"
          className={keyGhostClass}
          onClick={() => setConfirming(true)}
        >
          {t("leave")}
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-[var(--line)] px-4 py-3.5">
      <p className="font-mono text-[12px] leading-relaxed text-[var(--text)]">
        {t("leaveConfirm")}
      </p>
      {error && (
        <p className="mt-2 font-mono text-[11px] text-[var(--bright)]">
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className={keyGhostClass}
          onClick={() => setConfirming(false)}
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          className={keyClass}
          disabled={pending}
          onClick={() => run(() => leaveTeam())}
        >
          {t("leaveYes")}
        </button>
      </div>
    </div>
  );
}
