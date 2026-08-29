/*
  Siembra las cuatro mesas de mentoría y sus turnos de 25 minutos.
  Idempotente: repetirlo no duplica nada ni toca las reservas existentes.

    bun teams:seed-mentors
*/

import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const { seedMentorTables } = await import("@/lib/dashboard/seed");

const result = await seedMentorTables();

console.log(
  `\nMesas: ${result.tablesTotal} en total (${result.tablesCreated} nuevas).`,
);
console.log(
  `Turnos: ${result.slotsCreated} creados de ${result.slotsExpected} esperados.`,
);
if (result.slotsCreated === 0 && result.tablesCreated === 0) {
  console.log("Todo estaba ya sembrado. Nada que hacer.\n");
} else {
  console.log("Listo.\n");
}
