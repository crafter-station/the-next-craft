// Definición del flujo de registro: pasos, copy, validaciones y mensajes.
// Todo el texto visible del bot vive aquí.

export type Step =
  | "name"
  | "email"
  | "email_confirm"
  | "role"
  | "team"
  | "team_name"
  | "adult"
  | "github"
  | "source"
  | "summary"
  | "registered_menu";

export interface Answers {
  name?: string;
  email?: string;
  role?: string;
  teamStatus?: "tengo" | "busco" | "solo";
  teamName?: string;
  adult?: boolean;
  github?: string;
  source?: string;
}

export interface Session {
  phone: string;
  step: Step;
  answers: Answers;
  tries: number;
}

/** Input normalizado del webhook: texto libre o id de botón/lista. */
export interface Input {
  text?: string;
  buttonId?: string;
}

export type Reply =
  | { kind: "text"; body: string }
  // WhatsApp: máx 3 botones, títulos ≤ 20 chars
  | { kind: "buttons"; body: string; buttons: { id: string; title: string }[] }
  // WhatsApp: máx 10 filas, títulos ≤ 24 chars
  | {
      kind: "list";
      body: string;
      button: string;
      rows: { id: string; title: string; description?: string }[];
    }
  | { kind: "image"; url: string; caption?: string };

export const CONTACT_EMAIL = "hola@crafterstation.com";
export const MAX_TRIES = 3;

export const ROLES: Record<string, string> = {
  role_builder: "Builder",
  role_designer: "Designer",
  role_pm: "PM",
  role_marketer: "Marketer",
};

export const SOURCES: Record<string, string> = {
  source_x: "X / Twitter",
  source_ig: "Instagram / TikTok",
  source_friends: "Amigos / comunidad",
  source_uni: "Universidad",
  source_other: "Otro",
};

export const TEAM_LABELS: Record<NonNullable<Answers["teamStatus"]>, string> = {
  tengo: "Tengo equipo",
  busco: "Busco equipo",
  solo: "Voy solo",
};

// ── Validación de correo ────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// El correo es el único canal de confirmación → cazar typos de dominio comunes.
const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "yaho.com": "yahoo.com",
  "iclud.com": "icloud.com",
};

export function validateEmail(
  raw: string,
): { ok: true; email: string } | { ok: false; suggestion?: string } {
  const email = raw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false };
  const domain = email.split("@")[1];
  const fix = DOMAIN_TYPOS[domain];
  if (fix) {
    return { ok: false, suggestion: email.replace(`@${domain}`, `@${fix}`) };
  }
  return { ok: true, email };
}

// ── Mensajes ────────────────────────────────────────────────────────────────

export const WELCOME: Reply = {
  kind: "text",
  body:
    "Hola, soy el bot de registro de *THE NEXT CRAFT* — The First User Challenge.\n" +
    "24–26 JUL 2026 · Lima · 36 horas · 150 cupos.\n\n" +
    "Son 7 preguntas, ~90 segundos. Escribe *cancelar* en cualquier momento para salir.\n\n" +
    "Primero: ¿cuál es tu nombre completo?",
};

export const CANCELLED: Reply = {
  kind: "text",
  body: "Listo, cancelé el registro. Cuando quieras retomar, solo escríbeme de nuevo. 👋",
};

export function tooManyTries(): Reply {
  return {
    kind: "text",
    body: `Parece que algo no está funcionando. Escríbenos a ${CONTACT_EMAIL} y te registramos a mano.`,
  };
}

/** Prompt (o re-prompt) para cada paso. */
export function promptFor(step: Step, answers: Answers): Reply {
  switch (step) {
    case "name":
      return { kind: "text", body: "¿Cuál es tu nombre completo?" };
    case "email":
      return {
        kind: "text",
        body: "¿A qué correo te enviamos la confirmación? (revísalo bien, es nuestro único canal)",
      };
    case "email_confirm":
      return {
        kind: "buttons",
        body: `Tu correo es:\n*${answers.email}*\n\n¿Es correcto?`,
        buttons: [
          { id: "email_yes", title: "Sí, correcto" },
          { id: "email_no", title: "No, corregir" },
        ],
      };
    case "role":
      return {
        kind: "list",
        body: "¿Cuál es tu rol principal?",
        button: "Elegir rol",
        rows: [
          {
            id: "role_builder",
            title: "Builder",
            description: "Construyo producto / código",
          },
          {
            id: "role_designer",
            title: "Designer",
            description: "Diseño producto / visual",
          },
          { id: "role_pm", title: "PM", description: "Producto / estrategia" },
          {
            id: "role_marketer",
            title: "Marketer",
            description: "Growth / contenido / ventas",
          },
        ],
      };
    case "team":
      return {
        kind: "buttons",
        body: "¿Tienes equipo? (máx. 4 personas; también puedes formar uno en el evento)",
        buttons: [
          { id: "team_yes", title: "Tengo equipo" },
          { id: "team_seek", title: "Busco equipo" },
          { id: "team_solo", title: "Voy solo" },
        ],
      };
    case "team_name":
      return { kind: "text", body: "¿Cómo se llama tu equipo?" };
    case "adult":
      return {
        kind: "buttons",
        body: "¿Eres mayor de 18 años?",
        buttons: [
          { id: "adult_yes", title: "Sí" },
          { id: "adult_no", title: "No" },
        ],
      };
    case "github":
      return {
        kind: "buttons",
        body: "¿Tienes GitHub, portfolio o LinkedIn? Pega el link aquí — o salta este paso.",
        buttons: [{ id: "github_skip", title: "No tengo / saltar" }],
      };
    case "source":
      return {
        kind: "list",
        body: "Última: ¿cómo te enteraste del evento?",
        button: "Elegir",
        rows: Object.entries(SOURCES).map(([id, title]) => ({ id, title })),
      };
    case "summary":
      return {
        kind: "buttons",
        body: summaryText(answers),
        buttons: [
          { id: "confirm_yes", title: "Confirmar ✓" },
          { id: "confirm_restart", title: "Empezar de nuevo" },
        ],
      };
    case "registered_menu":
      return {
        kind: "buttons",
        body: "Ya tienes una postulación con nosotros. ¿Qué quieres hacer?",
        buttons: [
          { id: "reg_view", title: "Ver mi registro" },
          { id: "reg_update", title: "Actualizar datos" },
        ],
      };
  }
}

export function summaryText(a: Answers): string {
  const team =
    a.teamStatus === "tengo"
      ? `Equipo: ${a.teamName}`
      : `Equipo: ${a.teamStatus ? TEAM_LABELS[a.teamStatus] : "—"}`;
  return (
    "Revisa tu postulación:\n\n" +
    `Nombre: ${a.name}\n` +
    `Correo: ${a.email}\n` +
    `Rol: ${a.role}\n` +
    `${team}\n` +
    `Mayor de 18: ${a.adult ? "Sí" : "No"}\n` +
    `Link: ${a.github ?? "—"}\n` +
    `Te enteraste por: ${a.source}\n\n` +
    "¿Todo bien?"
  );
}

/** Mensajes de cierre tras guardar — usados por el webhook y el simulador. */
export function completionReplies(
  name: string,
  code: string,
  boardingPassUrl: string,
): Reply[] {
  const firstName = name.split(/\s+/)[0];
  return [
    {
      kind: "image",
      url: boardingPassUrl,
      caption: `${firstName}, tu postulación está dentro. Eres *${code}*.`,
    },
    {
      kind: "text",
      body:
        "La admisión es selectiva: te confirmamos *por correo* antes del evento. " +
        "Comparte tu pase y nos vemos en Lima. 🔵\n\n" +
        "— THE NEXT CRAFT · 24–26 JUL 2026",
    },
  ];
}
