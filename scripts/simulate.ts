// Simulador de la conversación en terminal — sin WhatsApp, sin DB.
//   bun run simulate
// Los botones se muestran numerados; responde con el número o texto libre.

import * as readline from "node:readline/promises";

import {
  advance,
  type ExistingRegistration,
} from "../src/lib/registration/engine";
import {
  completionReplies,
  type Input,
  type Reply,
  type Session,
} from "../src/lib/registration/flow";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let session: Session | null = null;
let existing: ExistingRegistration | null = null;
let buttons: { id: string; title: string }[] = [];
let counter = 0;

function render(reply: Reply): void {
  console.log();
  switch (reply.kind) {
    case "text":
      console.log(`🤖 ${reply.body}`);
      break;
    case "buttons":
      console.log(`🤖 ${reply.body}`);
      buttons = reply.buttons;
      for (const [i, b] of reply.buttons.entries()) {
        console.log(`   [${i + 1}] ${b.title}`);
      }
      break;
    case "list":
      console.log(`🤖 ${reply.body}`);
      buttons = reply.rows;
      for (const [i, r] of reply.rows.entries()) {
        console.log(
          `   [${i + 1}] ${r.title}${r.description ? ` — ${r.description}` : ""}`,
        );
      }
      break;
    case "image":
      console.log(`🤖 🖼  ${reply.url}`);
      if (reply.caption) console.log(`   ${reply.caption}`);
      break;
  }
}

console.log("── Simulador del bot de registro · THE NEXT CRAFT ──");
console.log("Escribe cualquier cosa para empezar. Ctrl+C para salir.\n");

while (true) {
  const raw = (await rl.question("tú > ")).trim();
  if (!raw) continue;

  // Número → botón mostrado; texto → mensaje libre
  const n = Number.parseInt(raw, 10);
  const input: Input =
    !Number.isNaN(n) && n >= 1 && n <= buttons.length
      ? { buttonId: buttons[n - 1].id, text: buttons[n - 1].title }
      : { text: raw };
  buttons = [];

  const result = advance(session, input, "51999999999", existing);
  session = result.session;
  result.replies.forEach(render);

  if (result.effect.type === "save") {
    counter++;
    const code = `CRAFTER-${String(counter).padStart(3, "0")}`;
    const a = result.effect.answers;
    existing = { code, status: "pending", answers: a };
    completionReplies(
      a.name,
      code,
      `https://thenextcraft.crafter.run/api/boarding-pass/${code}`,
    ).forEach(render);
    console.log("\n   ✓ effect: save →", JSON.stringify(a));
  }
  if (result.effect.type === "clear") session = null;
  console.log();
}
