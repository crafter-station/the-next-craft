// Máquina de estados pura del registro. Sin red, sin DB — testeable en local
// con `bun run simulate`.

import {
  type Answers,
  CANCELLED,
  type Input,
  MAX_TRIES,
  promptFor,
  type Reply,
  ROLES,
  type Session,
  SOURCES,
  type Step,
  summaryText,
  tooManyTries,
  validateEmail,
  WELCOME,
} from "./flow";

export type Effect =
  | { type: "none" }
  // Guardar registro (upsert por teléfono). El caller envía completionReplies().
  | {
      type: "save";
      answers: Required<Pick<Answers, "name" | "email" | "role">> & Answers;
    }
  // Borrar la sesión (cancelación o flujo terminado).
  | { type: "clear" };

export interface EngineResult {
  session: Session | null;
  replies: Reply[];
  effect: Effect;
}

/** Resumen mínimo de un registro existente, para el menú de re-contacto. */
export interface ExistingRegistration {
  code: string;
  status: string;
  answers: Answers;
}

const CANCEL_RE = /^\s*cancelar\s*$/i;

export function advance(
  session: Session | null,
  input: Input,
  phone: string,
  existing: ExistingRegistration | null,
): EngineResult {
  // Cancelación global
  if (input.text && CANCEL_RE.test(input.text)) {
    return { session: null, replies: [CANCELLED], effect: { type: "clear" } };
  }

  // Sin sesión activa: primer contacto o regreso post-registro
  if (!session) {
    if (existing) {
      const s: Session = {
        phone,
        step: "registered_menu",
        answers: {},
        tries: 0,
      };
      return {
        session: s,
        replies: [promptFor("registered_menu", {})],
        effect: { type: "none" },
      };
    }
    const s: Session = { phone, step: "name", answers: {}, tries: 0 };
    return { session: s, replies: [WELCOME], effect: { type: "none" } };
  }

  const result = handleStep(session, input, existing);

  // Re-prompt con límite de intentos
  if (result === "invalid") {
    const tries = session.tries + 1;
    if (tries >= MAX_TRIES) {
      return {
        session: { ...session, tries: 0 },
        replies: [tooManyTries(), promptFor(session.step, session.answers)],
        effect: { type: "none" },
      };
    }
    return {
      session: { ...session, tries },
      replies: [
        { kind: "text", body: "No te entendí. 🤔" },
        promptFor(session.step, session.answers),
      ],
      effect: { type: "none" },
    };
  }

  return result;
}

type StepResult = EngineResult | "invalid";

function next(
  session: Session,
  step: Step,
  answers: Answers,
  extra: Reply[] = [],
): EngineResult {
  const s: Session = { ...session, step, answers, tries: 0 };
  return {
    session: s,
    replies: [...extra, promptFor(step, answers)],
    effect: { type: "none" },
  };
}

function handleStep(
  session: Session,
  input: Input,
  existing: ExistingRegistration | null,
): StepResult {
  const a = session.answers;
  const text = input.text?.trim();

  switch (session.step) {
    case "name": {
      if (!text || text.length < 2 || text.length > 120) return "invalid";
      return next(session, "email", { ...a, name: text });
    }

    case "email": {
      if (!text) return "invalid";
      const v = validateEmail(text);
      if (!v.ok) {
        if (v.suggestion) {
          return {
            session: { ...session, tries: 0 },
            replies: [
              {
                kind: "text",
                body: `Ese dominio parece tener un typo. ¿Quisiste decir *${v.suggestion}*? Escríbelo de nuevo.`,
              },
            ],
            effect: { type: "none" },
          };
        }
        return "invalid";
      }
      return next(session, "email_confirm", { ...a, email: v.email });
    }

    case "email_confirm": {
      if (input.buttonId === "email_yes") return next(session, "role", a);
      if (input.buttonId === "email_no")
        return next(session, "email", { ...a, email: undefined });
      return "invalid";
    }

    case "role": {
      // Acepta el id de la lista o el rol tipeado a mano
      const byId = input.buttonId ? ROLES[input.buttonId] : undefined;
      const byText = text
        ? Object.values(ROLES).find(
            (r) => r.toLowerCase() === text.toLowerCase(),
          )
        : undefined;
      const role = byId ?? byText;
      if (!role) return "invalid";
      return next(session, "team", { ...a, role });
    }

    case "team": {
      if (input.buttonId === "team_yes") {
        return next(session, "team_name", { ...a, teamStatus: "tengo" });
      }
      if (input.buttonId === "team_seek") {
        return next(session, "adult", { ...a, teamStatus: "busco" });
      }
      if (input.buttonId === "team_solo") {
        return next(session, "adult", { ...a, teamStatus: "solo" });
      }
      return "invalid";
    }

    case "team_name": {
      if (!text || text.length > 80) return "invalid";
      return next(session, "adult", { ...a, teamName: text });
    }

    case "adult": {
      if (input.buttonId === "adult_yes")
        return next(session, "github", { ...a, adult: true });
      if (input.buttonId === "adult_no") {
        // Menores: quedan flagged; los organizadores deciden caso por caso.
        return next(session, "github", { ...a, adult: false });
      }
      return "invalid";
    }

    case "github": {
      if (input.buttonId === "github_skip") return next(session, "source", a);
      if (!text || text.length > 200) return "invalid";
      return next(session, "source", { ...a, github: text });
    }

    case "source": {
      const source = input.buttonId ? SOURCES[input.buttonId] : undefined;
      if (!source) return "invalid";
      return next(session, "summary", { ...a, source });
    }

    case "summary": {
      if (input.buttonId === "confirm_restart") {
        return next(session, "name", {}, [
          { kind: "text", body: "Ok, empecemos de nuevo." },
        ]);
      }
      if (input.buttonId === "confirm_yes") {
        if (!a.name || !a.email || !a.role) return "invalid"; // no debería pasar
        return {
          session: null,
          replies: [], // el caller envía completionReplies() con el código real
          effect: {
            type: "save",
            answers: { ...a, name: a.name, email: a.email, role: a.role },
          },
        };
      }
      return "invalid";
    }

    case "registered_menu": {
      if (input.buttonId === "reg_view" && existing) {
        return {
          session: null,
          replies: [
            {
              kind: "text",
              body:
                `Tu postulación *${existing.code}* — estado: *${statusLabel(existing.status)}*\n\n` +
                summaryText(existing.answers),
            },
          ],
          effect: { type: "clear" },
        };
      }
      if (input.buttonId === "reg_update") {
        return next(session, "name", {}, [
          {
            kind: "text",
            body: "Vamos a actualizar tu postulación (conservas tu código). Mismas 7 preguntas:",
          },
        ]);
      }
      return "invalid";
    }
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "approved":
      return "Aprobada ✓";
    case "rejected":
      return "No aprobada";
    default:
      return "En revisión";
  }
}
