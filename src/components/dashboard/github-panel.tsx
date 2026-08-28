"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";
import {
  provisionTeamRepo,
  refreshRepoInvites,
  syncGithubLink,
} from "@/lib/dashboard/github-actions";

import { keyClass, keyGhostClass, Panel, PanelHead, Row } from "./kit";

export type GithubMemberView = {
  participantId: string;
  fullName: string;
  login: string | null;
  inviteState: "pending" | "accepted" | "failed" | null;
  isCaptain: boolean;
  isYou: boolean;
};

export type GithubPanelProps = {
  /** La cuenta vinculada del hacker en sesión. */
  linked: { login: string; avatarUrl: string | null } | null;
  /** Vinculó en GitHub pero aún no copiamos el login: hay que sincronizar. */
  needsSync: boolean;
  isCaptain: boolean;
  repo: {
    fullName: string;
    url: string;
    status: "pending" | "ready" | "failed";
    error: string | null;
    invitationsUrl: string;
  } | null;
  members: GithubMemberView[];
};

export function GithubPanel({
  linked,
  needsSync,
  isCaptain,
  repo,
  members,
}: GithubPanelProps) {
  const t = useTranslations("dashboard.team.github");
  const tErrors = useTranslations("dashboard.team.errors");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const synced = useRef(false);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok && res.error) setError(tErrors(res.error));
    });
  };

  const hasPending = members.some((m) => m.inviteState === "pending");

  /*
    Dos puestas al día automáticas, una sola vez por montaje:
    – al volver de GitHub hay una cuenta vinculada que todavía no tiene login;
    – si quedan invitaciones colgando, puede que ya las hayan aceptado.
  */
  useEffect(() => {
    if (synced.current) return;
    if (!needsSync && !hasPending) return;
    synced.current = true;
    start(async () => {
      if (needsSync) await syncGithubLink();
      else await refreshRepoInvites();
    });
  }, [needsSync, hasPending]);

  const linkGithub = () => {
    setError(null);
    start(async () => {
      const res = await authClient.linkSocial({
        provider: "github",
        callbackURL: window.location.pathname,
      });
      const url = res.data && "url" in res.data ? res.data.url : null;
      if (url) window.location.href = url;
      else setError(tErrors("github-failed"));
    });
  };

  return (
    <Panel className="mt-5">
      <PanelHead n={37} label={t("label")} title={t("title")} />

      <div className="border-b border-[var(--line)] px-4 py-4">
        <p className="font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
          {t("body")}
        </p>

        {!linked ? (
          <button
            type="button"
            className={`${keyClass} mt-4`}
            disabled={pending}
            onClick={linkGithub}
          >
            {t("link")} →
          </button>
        ) : (
          <p className="mt-3 font-mono text-[12px] text-[var(--text)]">
            <span className="text-[var(--text-dim)]">{t("linkedAs")} </span>
            <a
              href={`https://github.com/${linked.login}`}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--bright)] underline-offset-4 hover:underline"
            >
              @{linked.login}
            </a>
          </p>
        )}
      </div>

      {repo?.status === "ready" ? (
        <div className="border-b border-[var(--line)] px-4 py-4">
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
            {t("repoLabel")}
          </p>
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block truncate font-mono text-[15px] text-[var(--bright)] underline-offset-4 hover:underline"
          >
            {repo.fullName}
          </a>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-[var(--text-dim)]">
            {t("repoBody")}
          </p>
        </div>
      ) : (
        <div className="border-b border-[var(--line)] px-4 py-4">
          {repo?.status === "pending" && (
            <p className="font-mono text-[12px] text-[var(--text-dim)]">
              {t("creating")}
            </p>
          )}
          {repo?.status === "failed" && (
            <p className="font-mono text-[12px] text-[var(--bright)]">
              {t("failed")}
              {repo.error ? ` — ${repo.error}` : ""}
            </p>
          )}
          {isCaptain ? (
            <button
              type="button"
              className={`${keyClass} ${repo ? "mt-3" : ""}`}
              disabled={pending || !linked || repo?.status === "pending"}
              onClick={() => run(() => provisionTeamRepo())}
            >
              {repo?.status === "failed" ? t("retry") : t("create")} →
            </button>
          ) : (
            <p className="font-mono text-[12px] text-[var(--text-dim)]">
              {t("waitCaptain")}
            </p>
          )}
          {isCaptain && !linked && (
            <p className="mt-2 font-mono text-[11px] text-[var(--text-dim)]">
              {t("captainNeedsLink")}
            </p>
          )}
        </div>
      )}

      <ul>
        {members.map((member) => (
          <Row key={member.participantId} marker="▸">
            <span className="text-[var(--text)]">{member.fullName}</span>
            {member.login && (
              <span className="ml-2 text-[11px] text-[var(--text-dim)]">
                @{member.login}
              </span>
            )}
            <span className="ml-2 text-[11px] text-[var(--bright)]">
              {!member.login
                ? t("stateUnlinked")
                : repo?.status !== "ready"
                  ? ""
                  : member.inviteState === "accepted"
                    ? t("stateAccepted")
                    : member.inviteState === "failed"
                      ? t("stateFailed")
                      : member.inviteState === "pending"
                        ? t("statePending")
                        : t("stateQueued")}
            </span>
            {member.isYou &&
              member.inviteState === "pending" &&
              repo?.status === "ready" && (
                <a
                  href={repo.invitationsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 text-[11px] text-[var(--bright)] underline underline-offset-4"
                >
                  {t("accept")}
                </a>
              )}
          </Row>
        ))}
      </ul>

      {error && (
        <p className="border-t border-[var(--line)] px-4 py-3 font-mono text-[11px] text-[var(--bright)]">
          {error}
        </p>
      )}

      {repo?.status === "ready" && (
        <div className="border-t border-[var(--line)] px-4 py-3.5">
          <button
            type="button"
            className={keyGhostClass}
            disabled={pending}
            onClick={() => run(() => refreshRepoInvites())}
          >
            {t("refresh")}
          </button>
        </div>
      )}
    </Panel>
  );
}
