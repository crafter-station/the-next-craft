import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { renderToBuffer } from "@react-pdf/renderer";

import type { EventRole } from "../documents/role-invitations/event-details";
import { FormalRoleInvitation } from "../documents/role-invitations/formal-role-invitation";

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function filenamePart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

const eventRole = argument("--role");
const recipientName = argument("--name");
const recipientBackground = argument("--background");
const issuedOn =
  argument("--date") ??
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "long",
    timeZone: "America/Lima",
  }).format(new Date());

if (eventRole !== "mentor" && eventRole !== "judge") {
  throw new Error('Indica --role "mentor" o --role "judge".');
}

if (!recipientName) {
  throw new Error('Indica la persona invitada con --name "Nombre completo".');
}

const content = await renderToBuffer(
  <FormalRoleInvitation
    eventRole={eventRole satisfies EventRole}
    recipientName={recipientName}
    recipientBackground={recipientBackground}
    issuedOn={issuedOn}
  />,
);
const recipient = filenamePart(recipientName) || "invitado";
const outputPath = path.resolve(
  argument("--output") ??
    path.join(".invitation-output", `invitacion-${eventRole}-${recipient}.pdf`),
);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, content);

console.log(`Generado ${path.relative(process.cwd(), outputPath)}`);
