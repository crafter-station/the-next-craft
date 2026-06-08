// Test de humo de la máquina de estados — sin red, sin DB.
//   bun scripts/test-flow.ts
// Recorre el happy path completo + typo de correo + cancelación + re-contacto.

import {
  advance,
  type ExistingRegistration,
} from "../src/lib/registration/engine";
import type { Input, Session } from "../src/lib/registration/flow";

let failures = 0;

function check(label: string, cond: boolean): void {
  console.log(`${cond ? "✓" : "✗ FAIL"} ${label}`);
  if (!cond) failures++;
}

const PHONE = "51999999999";

function run(
  steps: Input[],
  existing: ExistingRegistration | null = null,
): ReturnType<typeof advance> {
  let session: Session | null = null;
  let last: ReturnType<typeof advance> | null = null;
  for (const input of steps) {
    last = advance(session, input, PHONE, existing);
    session = last.session;
  }
  if (!last) throw new Error("no steps");
  return last;
}

// ── Happy path completo ─────────────────────────────────────────────────────
const happy = run([
  { text: "hola" },
  { text: "Shiara Arauzo" },
  { text: "shiara@gmail.com" },
  { buttonId: "email_yes" },
  { buttonId: "role_designer" },
  { buttonId: "team_yes" },
  { text: "Los Crafters" },
  { buttonId: "adult_yes" },
  { text: "github.com/shiarauzo" },
  { buttonId: "source_friends" },
  { buttonId: "confirm_yes" },
]);
check("happy path termina en effect save", happy.effect.type === "save");
if (happy.effect.type === "save") {
  const a = happy.effect.answers;
  check("nombre capturado", a.name === "Shiara Arauzo");
  check("correo capturado", a.email === "shiara@gmail.com");
  check("rol capturado", a.role === "Designer");
  check(
    "equipo capturado",
    a.teamStatus === "tengo" && a.teamName === "Los Crafters",
  );
  check("mayor de edad", a.adult === true);
  check("github capturado", a.github === "github.com/shiarauzo");
  check("source capturado", a.source === "Amigos / comunidad");
}
check("sesión limpia tras guardar", happy.session === null);

// ── Typo de dominio sugiere corrección ──────────────────────────────────────
const typo = run([
  { text: "hola" },
  { text: "Ana" },
  { text: "ana@gmial.com" },
]);
check(
  "typo gmial.com sugiere gmail.com",
  typo.replies.some(
    (r) => r.kind === "text" && r.body.includes("ana@gmail.com"),
  ),
);
check("typo no avanza de paso", typo.session?.step === "email");

// ── 'Busco equipo' salta el nombre de equipo ────────────────────────────────
const seek = run([
  { text: "hola" },
  { text: "Ana" },
  { text: "ana@gmail.com" },
  { buttonId: "email_yes" },
  { buttonId: "role_pm" },
  { buttonId: "team_seek" },
]);
check("busco equipo salta a +18", seek.session?.step === "adult");

// ── Cancelación global ──────────────────────────────────────────────────────
const cancel = run([{ text: "hola" }, { text: "Ana" }, { text: "cancelar" }]);
check(
  "cancelar limpia la sesión",
  cancel.session === null && cancel.effect.type === "clear",
);

// ── Input inválido re-promptea sin avanzar ──────────────────────────────────
const invalid = run([
  { text: "hola" },
  { text: "Ana" },
  { text: "esto no es un correo" },
]);
check("correo inválido no avanza", invalid.session?.step === "email");
check("correo inválido incrementa tries", invalid.session?.tries === 1);

// ── Re-contacto de un registrado muestra el menú ────────────────────────────
const existing: ExistingRegistration = {
  code: "CRAFTER-007",
  status: "pending",
  answers: { name: "Ana", email: "ana@gmail.com", role: "PM" },
};
const menu = run([{ text: "hola" }], existing);
check("registrado ve el menú", menu.session?.step === "registered_menu");

const view = run([{ text: "hola" }, { buttonId: "reg_view" }], existing);
check(
  "ver registro muestra código y estado",
  view.replies.some(
    (r) =>
      r.kind === "text" &&
      r.body.includes("CRAFTER-007") &&
      r.body.includes("En revisión"),
  ),
);

const update = run([{ text: "hola" }, { buttonId: "reg_update" }], existing);
check("actualizar reinicia el flujo", update.session?.step === "name");

console.log(failures === 0 ? "\nTodo verde ✓" : `\n${failures} fallos ✗`);
process.exit(failures === 0 ? 0 : 1);
