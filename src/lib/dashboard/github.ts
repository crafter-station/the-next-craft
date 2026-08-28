/*
  El puente entre una cuenta de GitHub vinculada y el repo que la organización
  le entrega al equipo.

  Reparto: aquí viven las consultas y los efectos idempotentes (sincronizar la
  identidad, invitar, revocar). Las server actions de `github-actions.ts` solo
  resuelven sesión, comprueban permisos y llaman aquí.

  Todo lo que toca la API de GitHub es reintentable: invitar dos veces a la
  misma persona no rompe nada, y crear el repo está protegido con un cerrojo en
  la propia fila del equipo.
*/

import { and, eq, isNull, lt, or, sql } from "drizzle-orm";

import type { CityKey } from "@/lib/cities";
import { db } from "@/lib/db";
import {
  account,
  dashboardTeamMembers,
  dashboardTeams,
  type GithubInviteState,
  participantGithub,
} from "@/lib/db/schema";
import {
  createRepoFromTemplate,
  deleteInvitation,
  fetchGithubUserById,
  GithubApiError,
  type GithubConfig,
  githubConfig,
  inviteCollaborator,
  listPendingInvitations,
  removeCollaborator,
  repoHtmlUrl,
  setRepoTopics,
} from "@/lib/github/api";

export type GithubIdentity = {
  githubUserId: string;
  login: string;
  avatarUrl: string | null;
};

export type GithubError =
  | "github-not-configured"
  | "github-not-linked"
  | "github-taken"
  | "github-failed"
  | "repo-in-progress";

/** ¿Está el feature encendido en este entorno? */
export function githubEnabled() {
  return githubConfig() !== null;
}

export async function findGithubIdentity(
  participantId: string,
): Promise<GithubIdentity | null> {
  const rows = await db
    .select({
      githubUserId: participantGithub.githubUserId,
      login: participantGithub.login,
      avatarUrl: participantGithub.avatarUrl,
    })
    .from(participantGithub)
    .where(eq(participantGithub.participantId, participantId))
    .limit(1);
  return rows[0] ?? null;
}

/** El id numérico de GitHub que better-auth guardó al vincular la cuenta. */
export async function findGithubAccountId(userId: string) {
  const rows = await db
    .select({ accountId: account.accountId })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "github")))
    .limit(1);
  return rows[0]?.accountId ?? null;
}

/**
 * Copia la cuenta vinculada a `participant_github`, resolviendo el login desde
 * el id numérico. Es idempotente: se puede llamar en cada carga de la página.
 */
export async function syncGithubIdentity(participant: {
  id: string;
  userId: string;
}): Promise<
  { ok: true; identity: GithubIdentity } | { ok: false; error: GithubError }
> {
  const config = githubConfig();
  if (!config) return { ok: false, error: "github-not-configured" };

  const accountId = await findGithubAccountId(participant.userId);
  if (!accountId) return { ok: false, error: "github-not-linked" };

  let user: Awaited<ReturnType<typeof fetchGithubUserById>>;
  try {
    user = await fetchGithubUserById(config, accountId);
  } catch (error) {
    console.error("GitHub user lookup failed", error);
    return { ok: false, error: "github-failed" };
  }
  if (!user) return { ok: false, error: "github-not-linked" };

  try {
    await db
      .insert(participantGithub)
      .values({
        participantId: participant.id,
        githubUserId: user.githubUserId,
        login: user.login,
        avatarUrl: user.avatarUrl,
      })
      .onConflictDoUpdate({
        target: participantGithub.participantId,
        set: {
          githubUserId: user.githubUserId,
          login: user.login,
          avatarUrl: user.avatarUrl,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    // Choca contra el índice único de `github_user_id`: esa cuenta ya está en
    // otra acreditación. Suele ser alguien que se registró dos veces.
    console.error("GitHub identity upsert failed", error);
    return { ok: false, error: "github-taken" };
  }

  return { ok: true, identity: user };
}

/* ── Repo del equipo ───────────────────────────────────────────── */

type TeamRepoRow = {
  id: string;
  slug: string;
  name: string;
  city: CityKey | null;
  track: string | null;
  githubRepoFullName: string | null;
  githubRepoStatus: "pending" | "ready" | "failed" | null;
};

type RepoMember = {
  participantId: string;
  isCaptain: boolean;
  login: string | null;
  githubInviteId: string | null;
  githubInviteState: GithubInviteState | null;
};

async function loadTeam(teamId: string): Promise<TeamRepoRow | null> {
  const rows = await db
    .select({
      id: dashboardTeams.id,
      slug: dashboardTeams.slug,
      name: dashboardTeams.name,
      city: dashboardTeams.city,
      track: dashboardTeams.track,
      githubRepoFullName: dashboardTeams.githubRepoFullName,
      githubRepoStatus: dashboardTeams.githubRepoStatus,
    })
    .from(dashboardTeams)
    .where(eq(dashboardTeams.id, teamId))
    .limit(1);
  return rows[0] ?? null;
}

async function loadMembers(teamId: string): Promise<RepoMember[]> {
  return db
    .select({
      participantId: dashboardTeamMembers.participantId,
      isCaptain: dashboardTeamMembers.isCaptain,
      login: participantGithub.login,
      githubInviteId: dashboardTeamMembers.githubInviteId,
      githubInviteState: dashboardTeamMembers.githubInviteState,
    })
    .from(dashboardTeamMembers)
    .leftJoin(
      participantGithub,
      eq(participantGithub.participantId, dashboardTeamMembers.participantId),
    )
    .where(eq(dashboardTeamMembers.teamId, teamId));
}

/** `tnc26-lima-terminal-velocity`, recortado a lo que acepta GitHub. */
export function repoNameFor(
  config: GithubConfig,
  team: { slug: string; city: CityKey | null },
  suffix?: string,
) {
  const parts = [config.prefix, team.city ?? "hub", team.slug, suffix].filter(
    Boolean,
  );
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function topicsFor(team: TeamRepoRow, prefix: string) {
  const topics = [prefix];
  if (team.city) topics.push(`${prefix}-${team.city}`);
  if (team.track) topics.push(`${prefix}-${team.track}`);
  return topics;
}

/**
 * Crea el repo del equipo desde el template y reparte las invitaciones.
 *
 * El cerrojo es un UPDATE condicional sobre `github_repo_status`: solo pasa
 * quien consigue moverlo a `pending`. Si otro clic llegó primero devolvemos
 * `repo-in-progress` en vez de crear un segundo repo.
 */
export async function provisionRepo(
  teamId: string,
): Promise<{ ok: true } | { ok: false; error: GithubError }> {
  const config = githubConfig();
  if (!config) return { ok: false, error: "github-not-configured" };

  const team = await loadTeam(teamId);
  if (!team) return { ok: false, error: "github-failed" };

  // Ya está: solo faltan invitaciones (alguien entró después de crearlo).
  if (team.githubRepoStatus === "ready" && team.githubRepoFullName) {
    await syncInvites(teamId);
    return { ok: true };
  }

  // Un `pending` viejo es un intento que murió a media llamada (se cayó el
  // proceso, rotó el deploy). Pasados dos minutos se puede volver a reclamar.
  const stale = new Date(Date.now() - 2 * 60 * 1000);
  const claimed = await db
    .update(dashboardTeams)
    .set({
      githubRepoStatus: "pending",
      githubRepoError: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(dashboardTeams.id, teamId),
        or(
          isNull(dashboardTeams.githubRepoStatus),
          eq(dashboardTeams.githubRepoStatus, "failed"),
          and(
            eq(dashboardTeams.githubRepoStatus, "pending"),
            lt(dashboardTeams.updatedAt, stale),
          ),
        ),
      ),
    )
    .returning({ id: dashboardTeams.id });
  if (claimed.length === 0) return { ok: false, error: "repo-in-progress" };

  const description = `${team.name} — The Next Craft 2026${
    team.city ? ` · ${team.city}` : ""
  }`;

  let created: { fullName: string; htmlUrl: string } | null = null;
  let lastError: unknown = null;

  // Un reintento con sufijo: el nombre puede estar tomado por un repo de una
  // edición anterior o por un intento previo que murió a medio camino.
  for (const suffix of [undefined, Math.random().toString(36).slice(2, 6)]) {
    try {
      created = await createRepoFromTemplate(config, {
        name: repoNameFor(config, team, suffix),
        description,
        isPrivate: false,
      });
      break;
    } catch (error) {
      lastError = error;
      if (error instanceof GithubApiError && error.isNameTaken) continue;
      break;
    }
  }

  if (!created) {
    const message =
      lastError instanceof Error ? lastError.message : "Error desconocido";
    console.error("GitHub repo creation failed", lastError);
    await db
      .update(dashboardTeams)
      .set({
        githubRepoStatus: "failed",
        githubRepoError: message.slice(0, 400),
        updatedAt: new Date(),
      })
      .where(eq(dashboardTeams.id, teamId));
    return { ok: false, error: "github-failed" };
  }

  await db
    .update(dashboardTeams)
    .set({
      githubRepoFullName: created.fullName,
      githubRepoUrl: created.htmlUrl,
      githubRepoStatus: "ready",
      githubRepoError: null,
      githubRepoCreatedAt: new Date(),
      // El campo libre del formulario solo se rellena si estaba vacío: si el
      // equipo ya apuntó a otro repo, manda lo que ellos escribieron.
      repoUrl: sql`coalesce(${dashboardTeams.repoUrl}, ${created.htmlUrl})`,
      updatedAt: new Date(),
    })
    .where(eq(dashboardTeams.id, teamId));

  // Los topics son cosmética para los mentores: si fallan, el repo ya existe.
  try {
    await setRepoTopics(
      config,
      created.fullName,
      topicsFor(team, config.prefix),
    );
  } catch (error) {
    console.error("GitHub topics failed", error);
  }

  await syncInvites(teamId);
  return { ok: true };
}

/**
 * Invita a quien tenga GitHub vinculado y aún no tenga invitación, y marca como
 * aceptadas las que ya no aparecen pendientes en el repo.
 */
export async function syncInvites(teamId: string) {
  const config = githubConfig();
  if (!config) return;

  const team = await loadTeam(teamId);
  const fullName = team?.githubRepoFullName;
  if (!team || !fullName || team.githubRepoStatus !== "ready") return;

  const members = await loadMembers(teamId);

  for (const member of members) {
    if (!member.login) continue;
    if (member.githubInviteState === "pending") continue;
    if (member.githubInviteState === "accepted") continue;
    await inviteMember(config, fullName, teamId, member);
  }

  const stillPending = members.some(
    (m) => m.githubInviteState === "pending" && m.githubInviteId,
  );
  if (!stillPending) return;

  let pending: { id: string; login: string | null }[];
  try {
    pending = await listPendingInvitations(config, fullName);
  } catch (error) {
    console.error("GitHub invitations listing failed", error);
    return;
  }

  const pendingIds = new Set(pending.map((invitation) => invitation.id));
  for (const member of members) {
    if (member.githubInviteState !== "pending" || !member.githubInviteId)
      continue;
    if (pendingIds.has(member.githubInviteId)) continue;
    await db
      .update(dashboardTeamMembers)
      .set({ githubInviteState: "accepted" })
      .where(
        and(
          eq(dashboardTeamMembers.teamId, teamId),
          eq(dashboardTeamMembers.participantId, member.participantId),
        ),
      );
  }
}

async function inviteMember(
  config: GithubConfig,
  fullName: string,
  teamId: string,
  member: RepoMember,
) {
  if (!member.login) return;
  try {
    // El capitán manda en su repo: puede añadir gente y conectar integraciones
    // sin pasar por nosotros.
    const { invitationId } = await inviteCollaborator(
      config,
      fullName,
      member.login,
      member.isCaptain ? "admin" : "push",
    );
    await db
      .update(dashboardTeamMembers)
      .set({
        githubInviteId: invitationId,
        // Sin invitación es que ya tenía acceso: cuenta como aceptada.
        githubInviteState: invitationId ? "pending" : "accepted",
        githubInvitedAt: new Date(),
      })
      .where(
        and(
          eq(dashboardTeamMembers.teamId, teamId),
          eq(dashboardTeamMembers.participantId, member.participantId),
        ),
      );
  } catch (error) {
    console.error(`GitHub invite failed for ${member.login}`, error);
    await db
      .update(dashboardTeamMembers)
      .set({ githubInviteState: "failed", githubInvitedAt: new Date() })
      .where(
        and(
          eq(dashboardTeamMembers.teamId, teamId),
          eq(dashboardTeamMembers.participantId, member.participantId),
        ),
      );
  }
}

/** Invita a una sola persona. Se llama al entrar a un equipo que ya tiene repo. */
export async function inviteParticipant(teamId: string, participantId: string) {
  const config = githubConfig();
  if (!config) return;

  const team = await loadTeam(teamId);
  const fullName = team?.githubRepoFullName;
  if (!team || !fullName || team.githubRepoStatus !== "ready") return;

  const members = await loadMembers(teamId);
  const member = members.find((m) => m.participantId === participantId);
  if (!member?.login) return;
  if (member.githubInviteState === "accepted") return;

  await inviteMember(config, fullName, teamId, member);
}

/**
 * Sube al nuevo capitán a admin del repo.
 *
 * Cuando el capitán fundador se va, `leaveTeam` asciende a alguien para no
 * dejar el equipo sin cabeza — pero en GitHub ese ascenso no existía: el nuevo
 * capitán se quedaba con `push` y el repo sin ningún admin del equipo. Se llama
 * después de escribir el ascenso en la base, que es de donde sale el permiso.
 */
export async function promoteCaptain(teamId: string, participantId: string) {
  const config = githubConfig();
  if (!config) return;

  const team = await loadTeam(teamId);
  const fullName = team?.githubRepoFullName;
  if (!team || !fullName || team.githubRepoStatus !== "ready") return;

  const members = await loadMembers(teamId);
  const member = members.find((m) => m.participantId === participantId);
  if (!member?.login || !member.isCaptain) return;

  // Sin el filtro de `accepted` de `inviteParticipant`: aquí lo que cambia es
  // el permiso de alguien que probablemente ya está dentro.
  await inviteMember(config, fullName, teamId, member);
}

/** Los topics son el índice de los mentores y el track puede llegar después. */
export async function refreshRepoTopics(teamId: string) {
  const config = githubConfig();
  if (!config) return;

  const team = await loadTeam(teamId);
  const fullName = team?.githubRepoFullName;
  if (!team || !fullName || team.githubRepoStatus !== "ready") return;

  try {
    await setRepoTopics(config, fullName, topicsFor(team, config.prefix));
  } catch (error) {
    console.error("GitHub topics refresh failed", error);
  }
}

/**
 * Saca a alguien del repo al salir del equipo. Best effort: si GitHub falla,
 * el hacker igual sale del equipo — el acceso se limpia a mano.
 */
export async function revokeParticipant(teamId: string, participantId: string) {
  const config = githubConfig();
  if (!config) return;

  const team = await loadTeam(teamId);
  const fullName = team?.githubRepoFullName;
  if (!fullName) return;

  const [row] = await db
    .select({
      login: participantGithub.login,
      inviteId: dashboardTeamMembers.githubInviteId,
      inviteState: dashboardTeamMembers.githubInviteState,
    })
    .from(dashboardTeamMembers)
    .innerJoin(
      participantGithub,
      eq(participantGithub.participantId, dashboardTeamMembers.participantId),
    )
    .where(
      and(
        eq(dashboardTeamMembers.teamId, teamId),
        eq(dashboardTeamMembers.participantId, participantId),
      ),
    )
    .limit(1);
  if (!row?.login) return;

  try {
    if (row.inviteState === "pending" && row.inviteId) {
      await deleteInvitation(config, fullName, row.inviteId);
    }
    await removeCollaborator(config, fullName, row.login);
  } catch (error) {
    console.error("GitHub access revoke failed", error);
  }
}

/** Lo que necesita la vista de staff: un repo por equipo, sin llamar a GitHub. */
export async function listTeamRepos(city: CityKey | null) {
  const rows = await db
    .select({
      teamId: dashboardTeams.id,
      name: dashboardTeams.name,
      city: dashboardTeams.city,
      track: dashboardTeams.track,
      status: dashboardTeams.githubRepoStatus,
      fullName: dashboardTeams.githubRepoFullName,
      url: dashboardTeams.githubRepoUrl,
    })
    .from(dashboardTeams)
    .where(city ? eq(dashboardTeams.city, city) : undefined)
    .orderBy(dashboardTeams.name);

  return rows.map((row) => ({
    ...row,
    url: row.url ?? (row.fullName ? repoHtmlUrl(row.fullName) : null),
  }));
}
