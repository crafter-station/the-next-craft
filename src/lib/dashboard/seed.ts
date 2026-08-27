import { db } from "@/lib/db";
import { dashboardMentorSlots, dashboardMentorTables } from "@/lib/db/schema";

/**
 * Las cuatro mesas de mentoría son las comunidades organizadoras, no personas:
 * el contenido canónico solo dice «Mentorías con Crafter Station».
 *
 * `role` es una clave de traducción (`dashboard.mentors.roles.<role>`), no copy.
 */
const MENTOR_TABLES = [
  {
    slug: "crafter-station",
    org: "Crafter Station",
    role: "product",
    expertise: ["producto", "distribución", "demo"],
    sortOrder: 0,
  },
  {
    slug: "ai-labs",
    org: "AI Labs",
    role: "models",
    expertise: ["LLMs", "agentes", "evals"],
    sortOrder: 1,
  },
  {
    slug: "nucleo-labs",
    org: "Nucleo Labs",
    role: "engineering",
    expertise: ["backend", "infra", "tiempo real"],
    sortOrder: 2,
  },
  {
    slug: "open2",
    org: "Open2",
    role: "interface",
    expertise: ["frontend", "interfaz", "pitch"],
    sortOrder: 3,
  },
];

/** El bloque de mentorías canónico es 11:00–13:00: cuatro turnos de 25 min. */
const SLOT_WINDOWS = [
  ["11:00", "11:25"],
  ["11:30", "11:55"],
  ["12:00", "12:25"],
  ["12:30", "12:55"],
] as const;

/**
 * Idempotente: se puede repetir sin duplicar mesas ni turnos, y sin tocar las
 * reservas que ya existan.
 */
export async function seedMentorTables() {
  const tables = await db
    .insert(dashboardMentorTables)
    .values(MENTOR_TABLES)
    .onConflictDoNothing({ target: dashboardMentorTables.slug })
    .returning({
      id: dashboardMentorTables.id,
      slug: dashboardMentorTables.slug,
    });

  // Las que ya existían no vuelven en el RETURNING: hay que leerlas.
  const all = await db
    .select({ id: dashboardMentorTables.id, slug: dashboardMentorTables.slug })
    .from(dashboardMentorTables);

  const slots = all.flatMap((table) =>
    SLOT_WINDOWS.map(([startsAt, endsAt]) => ({
      mentorTableId: table.id,
      startsAt,
      endsAt,
    })),
  );

  const inserted = await db
    .insert(dashboardMentorSlots)
    .values(slots)
    // Único por (mesa, hora de inicio): repetir no duplica ni pisa reservas.
    .onConflictDoNothing({
      target: [
        dashboardMentorSlots.mentorTableId,
        dashboardMentorSlots.startsAt,
      ],
    })
    .returning({ id: dashboardMentorSlots.id });

  return {
    tablesCreated: tables.length,
    tablesTotal: all.length,
    slotsCreated: inserted.length,
    slotsExpected: slots.length,
  };
}
