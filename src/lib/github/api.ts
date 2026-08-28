/*
  Cliente mínimo de la REST API de GitHub. Sin SDK a propósito: son cinco
  llamadas y Octokit pesa más que todo el resto del dashboard junto. Mismo
  criterio que `registration/whatsapp.ts` y `registration/sheets.ts`.

  El token es de la organización (PAT de una cuenta con permiso para crear
  repos en la org). Nunca se usa el token OAuth del hacker: ese solo sirve para
  saber quién es, y better-auth ya lo guarda.
*/

const API = "https://api.github.com";
const API_VERSION = "2022-11-28";

export type GithubConfig = {
  token: string;
  /** Dueño de los repos de equipo. Casi siempre la org. */
  owner: string;
  templateOwner: string;
  templateRepo: string;
  /** Prefijo del nombre: `tnc26-lima-terminal-velocity`. */
  prefix: string;
};

/**
 * Devuelve la configuración o `null` si falta algo. Que falte no es un error:
 * en local nadie tiene el PAT de la org y el dashboard tiene que seguir
 * funcionando, solo que sin el panel de repos.
 */
export function githubConfig(): GithubConfig | null {
  const token = process.env.GITHUB_TOKEN?.trim();
  const template = process.env.GITHUB_TEMPLATE_REPO?.trim();
  if (!token || !template) return null;

  const [templateOwner, templateRepo] = template.split("/");
  if (!templateOwner || !templateRepo) return null;

  return {
    token,
    owner: process.env.GITHUB_TEAM_REPO_OWNER?.trim() || templateOwner,
    templateOwner,
    templateRepo,
    prefix: process.env.GITHUB_TEAM_REPO_PREFIX?.trim() || "tnc26",
  };
}

export class GithubApiError extends Error {
  readonly status: number;
  readonly errors: string[];

  constructor(status: number, message: string, errors: string[] = []) {
    super(message);
    this.name = "GithubApiError";
    this.status = status;
    this.errors = errors;
  }

  /** El nombre ya existe en la cuenta: hay que reintentar con otro. */
  get isNameTaken() {
    return (
      this.status === 422 &&
      this.errors.some((e) => e.toLowerCase().includes("already exists"))
    );
  }
}

type Json = Record<string, unknown>;

async function request<T>(
  config: GithubConfig,
  method: string,
  path: string,
  body?: Json,
): Promise<{ status: number; data: T }> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${config.token}`,
      "x-github-api-version": API_VERSION,
      "user-agent": "the-next-craft",
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as T) : (null as T);

  if (!res.ok) {
    const payload = (data ?? {}) as {
      message?: string;
      errors?: { message?: string; code?: string }[];
    };
    throw new GithubApiError(
      res.status,
      payload.message ?? `GitHub respondió ${res.status}`,
      (payload.errors ?? []).map((e) => e.message ?? e.code ?? ""),
    );
  }

  return { status: res.status, data };
}

export type GithubUser = {
  githubUserId: string;
  login: string;
  avatarUrl: string | null;
};

/**
 * Resuelve el login a partir del id numérico que guarda better-auth. El login
 * se puede cambiar en GitHub; el id no.
 */
export async function fetchGithubUserById(
  config: GithubConfig,
  githubUserId: string,
): Promise<GithubUser | null> {
  try {
    const { data } = await request<{
      id: number;
      login: string;
      avatar_url: string | null;
    }>(config, "GET", `/user/${encodeURIComponent(githubUserId)}`);
    return {
      githubUserId: String(data.id),
      login: data.login,
      avatarUrl: data.avatar_url,
    };
  } catch (error) {
    if (error instanceof GithubApiError && error.status === 404) return null;
    throw error;
  }
}

export type CreatedRepo = { fullName: string; htmlUrl: string };

/** `POST /generate`: copia el template en un repo nuevo, sin historia previa. */
export async function createRepoFromTemplate(
  config: GithubConfig,
  input: { name: string; description: string; isPrivate: boolean },
): Promise<CreatedRepo> {
  const { data } = await request<{ full_name: string; html_url: string }>(
    config,
    "POST",
    `/repos/${config.templateOwner}/${config.templateRepo}/generate`,
    {
      owner: config.owner,
      name: input.name,
      description: input.description,
      private: input.isPrivate,
      include_all_branches: false,
    },
  );
  return { fullName: data.full_name, htmlUrl: data.html_url };
}

/** Los topics son el índice de los mentores: `tnc26`, `tnc26-bogota`, … */
export async function setRepoTopics(
  config: GithubConfig,
  fullName: string,
  topics: string[],
) {
  await request(config, "PUT", `/repos/${fullName}/topics`, { names: topics });
}

export type CollaboratorInvite = {
  /** `null` cuando ya tenía acceso (miembro de la org, por ejemplo). */
  invitationId: string | null;
};

export async function inviteCollaborator(
  config: GithubConfig,
  fullName: string,
  login: string,
  permission: "push" | "maintain" | "admin",
): Promise<CollaboratorInvite> {
  const { status, data } = await request<{ id?: number } | null>(
    config,
    "PUT",
    `/repos/${fullName}/collaborators/${encodeURIComponent(login)}`,
    { permission },
  );
  // 204 = ya era colaborador y no hay invitación que aceptar.
  if (status === 204 || !data?.id) return { invitationId: null };
  return { invitationId: String(data.id) };
}

export async function removeCollaborator(
  config: GithubConfig,
  fullName: string,
  login: string,
) {
  await request(
    config,
    "DELETE",
    `/repos/${fullName}/collaborators/${encodeURIComponent(login)}`,
  );
}

export async function deleteInvitation(
  config: GithubConfig,
  fullName: string,
  invitationId: string,
) {
  await request(
    config,
    "DELETE",
    `/repos/${fullName}/invitations/${encodeURIComponent(invitationId)}`,
  );
}

/** Las que siguen sin aceptar. Si una desaparece de aquí, ya la aceptaron. */
export async function listPendingInvitations(
  config: GithubConfig,
  fullName: string,
): Promise<{ id: string; login: string | null }[]> {
  const { data } = await request<
    { id: number; invitee: { login: string } | null }[]
  >(config, "GET", `/repos/${fullName}/invitations?per_page=100`);
  return (data ?? []).map((invitation) => ({
    id: String(invitation.id),
    login: invitation.invitee?.login ?? null,
  }));
}

export function repoHtmlUrl(fullName: string) {
  return `https://github.com/${fullName}`;
}

/** Donde el invitado acepta. GitHub también lo manda por correo. */
export function invitationsUrl(fullName: string) {
  return `https://github.com/${fullName}/invitations`;
}
