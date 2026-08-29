/*
  Comprueba que el reparto de repos va a funcionar ANTES del evento.

  Todo lo que verifica aquí falla, si falla, en el peor momento posible: con el
  capitán delante pulsando «Crear el repo». Son cinco llamadas de lectura, no
  crea nada.

    bun run github:check
*/

import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const [{ githubConfig, GithubApiError }] = await Promise.all([
  import("@/lib/github/api"),
]);

const API = "https://api.github.com";
let failed = false;

function ok(label: string, detail = "") {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}

function bad(label: string, detail = "") {
  failed = true;
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

const cfg = githubConfig();
if (!cfg) {
  console.log("\nGITHUB\n");
  bad(
    "faltan variables",
    "hacen falta GITHUB_TOKEN y GITHUB_TEMPLATE_REPO (owner/repo)",
  );
  process.exit(1);
}

async function api<T>(path: string): Promise<{ status: number; data: T }> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${cfg?.token}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "the-next-craft",
    },
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : (null as T) };
}

console.log("\nGITHUB\n");
console.log(
  `  org: ${cfg.owner}   template: ${cfg.templateOwner}/${cfg.templateRepo}   prefijo: ${cfg.prefix}\n`,
);

// 1. El token: quién es y qué alcance tiene.
let botLogin: string | null = null;
try {
  const { status, data } = await api<{ login: string }>("/user");
  if (status === 200) {
    botLogin = data.login;
    ok("el token es válido", `autenticado como @${data.login}`);
  } else {
    bad("el token no sirve", `GET /user devolvió ${status}`);
  }
} catch (error) {
  bad("no se pudo hablar con GitHub", String(error));
}

// 2. El template: tiene que existir y estar marcado como template, o
//    `POST /generate` responde 404 sin explicar por qué.
const { status: tplStatus, data: tpl } = await api<{
  is_template: boolean;
  visibility: string;
  permissions?: { admin: boolean; push: boolean };
}>(`/repos/${cfg.templateOwner}/${cfg.templateRepo}`);

if (tplStatus === 404) {
  bad(
    "el repo template no existe (o el token no lo ve)",
    `${cfg.templateOwner}/${cfg.templateRepo}`,
  );
} else if (tplStatus !== 200) {
  bad("no se pudo leer el template", `devolvió ${tplStatus}`);
} else if (!tpl.is_template) {
  bad(
    "el repo existe pero NO está marcado como template",
    "Settings → Template repository",
  );
} else {
  ok(
    "el template está marcado como template",
    `visibilidad: ${tpl.visibility}`,
  );
}

// 3. La org y el permiso para crear repos en ella.
const { status: orgStatus } = await api(`/orgs/${cfg.owner}`);
if (orgStatus === 200) {
  ok("la organización existe", cfg.owner);
  if (botLogin) {
    const { status: memberStatus, data: membership } = await api<{
      role: string;
      state: string;
    }>(`/orgs/${cfg.owner}/memberships/${botLogin}`);
    if (memberStatus === 200 && membership.state === "active") {
      ok(`@${botLogin} es miembro de la org`, `rol: ${membership.role}`);
    } else if (memberStatus === 200) {
      bad(
        `la invitación de @${botLogin} a la org sigue sin aceptar`,
        `estado: ${membership.state}`,
      );
    } else {
      bad(
        `@${botLogin} no es miembro de ${cfg.owner}`,
        "no va a poder crear repos ahí",
      );
    }
  }
} else if (orgStatus === 404) {
  // Puede ser una cuenta personal en vez de una org: no es un error.
  ok("el dueño no es una organización", `${cfg.owner} parece cuenta personal`);
} else {
  bad("no se pudo leer la organización", `devolvió ${orgStatus}`);
}

// 4. OAuth: sin esto nadie puede vincular su cuenta y no hay a quién invitar.
if (
  process.env.GITHUB_CLIENT_ID?.trim() &&
  process.env.GITHUB_CLIENT_SECRET?.trim()
) {
  ok("las credenciales de la OAuth App están puestas");
  const base = process.env.BETTER_AUTH_URL?.trim();
  if (base) {
    ok(
      "el callback que tiene que estar en la OAuth App",
      `${base}/api/auth/callback/github`,
    );
  } else {
    bad(
      "falta BETTER_AUTH_URL",
      "sin ella el callback de OAuth no se resuelve",
    );
  }
} else {
  bad(
    "faltan GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET",
    "el botón de vincular GitHub no aparecerá",
  );
}

// 5. Cuántos repos de esta edición hay ya, para saber si se está reintentando
//    sobre una org que ya tiene equipos dentro.
try {
  const { status, data } = await api<{ total_count: number }>(
    `/search/repositories?q=${encodeURIComponent(`org:${cfg.owner} topic:${cfg.prefix}`)}&per_page=1`,
  );
  if (status === 200) {
    ok("repos de equipo ya creados", String(data.total_count));
  }
} catch (error) {
  if (!(error instanceof GithubApiError)) throw error;
}

console.log(
  failed
    ? "\n  Hay algo sin configurar: el panel de repos no va a funcionar.\n"
    : "\n  Todo listo. El capitán puede crear el repo de su equipo.\n",
);
process.exit(failed ? 1 : 0);
