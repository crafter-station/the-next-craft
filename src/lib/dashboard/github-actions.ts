"use server";

import { revalidatePath } from "next/cache";

import {
  githubEnabled,
  inviteParticipant,
  provisionRepo,
  syncGithubIdentity,
  syncInvites,
} from "./github";
import { currentHacker } from "./state";

export type GithubActionError =
  | "unauthenticated"
  | "no-participant"
  | "not-in-team"
  | "not-captain"
  | "github-not-configured"
  | "github-not-linked"
  | "github-taken"
  | "github-failed"
  | "repo-in-progress";

type Result = { ok: true } | { ok: false; error: GithubActionError };

function refresh() {
  revalidatePath("/[locale]/dashboard", "layout");
}

/**
 * Copia a la base la cuenta que better-auth acaba de vincular y, si el equipo
 * ya tiene repo, invita a quien acaba de vincularla. La llama el panel al
 * volver de GitHub y también al cargar la página si detecta cuenta sin copiar:
 * si el redirect se pierde por el camino, la siguiente visita lo arregla.
 */
export async function syncGithubLink(): Promise<Result> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };

  const synced = await syncGithubIdentity(ctx.participant);
  if (!synced.ok) return { ok: false, error: synced.error };

  if (ctx.team?.githubRepoStatus === "ready") {
    await inviteParticipant(ctx.team.id, ctx.participant.id);
  }

  refresh();
  return { ok: true };
}

/** Solo el capitán, y solo con su GitHub vinculado: es quien queda de admin. */
export async function provisionTeamRepo(): Promise<Result> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!githubEnabled()) return { ok: false, error: "github-not-configured" };
  if (!ctx.team) return { ok: false, error: "not-in-team" };

  const me = ctx.team.members.find(
    (m) => m.participantId === ctx.participant.id,
  );
  if (!me?.isCaptain) return { ok: false, error: "not-captain" };
  if (!me.githubLogin) return { ok: false, error: "github-not-linked" };

  const result = await provisionRepo(ctx.team.id);
  refresh();
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/** Reintenta invitaciones fallidas y marca como aceptadas las que ya no penden. */
export async function refreshRepoInvites(): Promise<Result> {
  const ctx = await currentHacker();
  if (ctx.error) return { ok: false, error: ctx.error };
  if (!ctx.team) return { ok: false, error: "not-in-team" };

  await syncInvites(ctx.team.id);
  refresh();
  return { ok: true };
}
