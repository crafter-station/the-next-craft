/*
  Deriva los equipos del dashboard a partir de `registrations`, que es donde el
  bot de WhatsApp ya guardó el nombre del equipo que declaró cada aspirante.

  No se inventan equipos: se agrupan los registros aprobados por nombre
  normalizado dentro de cada sede, y se cruza por email con
  `badge_participants` para saber quién tiene cuenta en la plataforma.

  `team_name` es texto libre, así que el script NO fusiona nombres parecidos por
  su cuenta: los reporta para que un humano decida. Corre en seco por defecto.

    bun scripts/derive-teams.ts            # informe, no escribe nada
    bun scripts/derive-teams.ts --apply    # escribe
*/

import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const [
  { db },
  { badgeParticipants, dashboardTeamMembers, dashboardTeams },
  { sql },
] = await Promise.all([
  import("@/lib/db"),
  import("@/lib/db/schema"),
  import("drizzle-orm"),
]);

const APPLY = process.argv.includes("--apply");

/* ── Sedes ─────────────────────────────────────────────────────
   `registrations.city` guarda la etiqueta que eligió la persona en WhatsApp
   ("Lima, Peru"); `badge_participants.city` guarda ya la CityKey. Mandamos
   la segunda cuando existe, porque viene de Luma.                          */
const CITY_KEYS = [
  "lima",
  "bogota",
  "guatemala",
  "arequipa",
  "salvador",
] as const;
type CityKey = (typeof CITY_KEYS)[number];

function cityKeyFromLabel(label: string | null): CityKey | null {
  if (!label) return null;
  const n = normalize(label);
  if (n.includes("lima")) return "lima";
  if (n.includes("bogota")) return "bogota";
  if (n.includes("guatemala")) return "guatemala";
  if (n.includes("arequipa")) return "arequipa";
  if (n.includes("salvador")) return "salvador";
  return null;
}

/** minúsculas, sin tildes, sin puntuación, espacios colapsados. */
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return normalize(value).replace(/\s/g, "-");
}

/** Distancia de edición, para avisar de nombres casi iguales. */
function distance(a: string, b: string) {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = temp;
    }
  }
  return prev[b.length];
}

type RegistrationRow = {
  email: string;
  name: string;
  city: string | null;
  role: string;
  team_status: string | null;
  team_name: string | null;
  created_at: string;
};

const { rows } = (await db.execute(sql`
  select email, name, city, role, team_status, team_name, created_at
  from registrations
  where status = 'approved'
  order by created_at asc
`)) as unknown as { rows: RegistrationRow[] };

console.log(`\nRegistros aprobados: ${rows.length}`);

const withTeam = rows.filter(
  (r) => r.team_status === "tengo" && r.team_name?.trim(),
);
const soloOrSeeking = rows.length - withTeam.length;
console.log(`  con equipo declarado: ${withTeam.length}`);
console.log(`  sin equipo (busco/solo): ${soloOrSeeking}`);

/* ── Cruce por email con quien ya tiene cuenta ─────────────── */
const participants = await db
  .select({
    id: badgeParticipants.id,
    email: badgeParticipants.email,
    city: badgeParticipants.city,
    fullName: badgeParticipants.fullName,
  })
  .from(badgeParticipants);

const participantByEmail = new Map(
  participants.map((p) => [p.email.trim().toLowerCase(), p]),
);

/* ── Agrupación por (sede, nombre normalizado) ─────────────── */
type Group = {
  cityKey: CityKey;
  normalized: string;
  displayName: string;
  rawNames: Set<string>;
  members: {
    participantId: string;
    fullName: string;
    role: string;
    isCaptain: boolean;
  }[];
  unmatched: { name: string; email: string }[];
};

const groups = new Map<string, Group>();
let noCity = 0;

for (const row of withTeam) {
  const email = row.email.trim().toLowerCase();
  const participant = participantByEmail.get(email);
  const cityKey =
    (participant?.city as CityKey | null) ?? cityKeyFromLabel(row.city);

  if (!cityKey) {
    noCity += 1;
    continue;
  }

  const teamName = row.team_name?.trim() ?? "";
  const normalized = normalize(teamName);
  if (!normalized) continue;

  const key = `${cityKey}::${normalized}`;
  let group = groups.get(key);
  if (!group) {
    group = {
      cityKey,
      normalized,
      displayName: teamName,
      rawNames: new Set(),
      members: [],
      unmatched: [],
    };
    groups.set(key, group);
  }
  group.rawNames.add(teamName);

  if (participant) {
    group.members.push({
      participantId: participant.id,
      fullName: participant.fullName,
      role: row.role,
      // El primero por fecha de registro queda como capitán.
      isCaptain: group.members.length === 0,
    });
  } else {
    group.unmatched.push({ name: row.name, email });
  }
}

const all = [...groups.values()].sort(
  (a, b) =>
    a.cityKey.localeCompare(b.cityKey) ||
    a.normalized.localeCompare(b.normalized),
);

console.log(`\nEquipos detectados: ${all.length}`);
if (noCity > 0) {
  console.warn(`  ⚠ ${noCity} registros sin sede identificable: se omiten`);
}

/* ── Informe ───────────────────────────────────────────────── */
const singletons = all.filter(
  (g) => g.members.length + g.unmatched.length === 1,
);
const totalUnmatched = all.reduce((n, g) => n + g.unmatched.length, 0);

for (const city of CITY_KEYS) {
  const inCity = all.filter((g) => g.cityKey === city);
  if (inCity.length === 0) continue;
  console.log(`\n── ${city.toUpperCase()} · ${inCity.length} equipos`);
  for (const g of inCity) {
    const variants =
      g.rawNames.size > 1 ? `  [${[...g.rawNames].join(" | ")}]` : "";
    console.log(
      `   ${g.displayName}  ·  ${g.members.length} con cuenta` +
        (g.unmatched.length ? `, ${g.unmatched.length} sin cuenta` : "") +
        variants,
    );
  }
}

/* Nombres casi iguales dentro de la misma sede: los decide un humano. */
const suspects: string[] = [];
for (const city of CITY_KEYS) {
  const inCity = all.filter((g) => g.cityKey === city);
  for (let i = 0; i < inCity.length; i += 1) {
    for (let j = i + 1; j < inCity.length; j += 1) {
      const a = inCity[i];
      const b = inCity[j];
      const close =
        distance(a.normalized, b.normalized) <= 2 ||
        a.normalized.includes(b.normalized) ||
        b.normalized.includes(a.normalized);
      if (close) {
        suspects.push(`   ${city}: "${a.displayName}"  ~  "${b.displayName}"`);
      }
    }
  }
}

if (suspects.length > 0) {
  console.warn(`\n⚠ Nombres casi iguales — revisa si son el mismo equipo:`);
  for (const s of suspects) console.warn(s);
}

if (singletons.length > 0) {
  console.warn(
    `\n⚠ ${singletons.length} equipos de una sola persona (¿nombre mal escrito?):`,
  );
  for (const g of singletons) {
    console.warn(`   ${g.cityKey}: "${g.displayName}"`);
  }
}

if (totalUnmatched > 0) {
  console.warn(
    `\n⚠ ${totalUnmatched} personas aprobadas con equipo pero sin cuenta en la plataforma.`,
  );
  console.warn(`   No podrán entrar al dashboard hasta que generen su badge.`);
}

/* ── Escritura ─────────────────────────────────────────────── */
if (!APPLY) {
  console.log(
    `\nSimulación. Nada se escribió. Repite con --apply cuando el informe cuadre.\n`,
  );
  process.exit(0);
}

let createdTeams = 0;
let addedMembers = 0;

for (const g of all) {
  if (g.members.length === 0) continue; // sin nadie con cuenta, no hay equipo que crear

  const slug = `${slugify(g.displayName)}-${g.cityKey}`;

  await db
    .insert(dashboardTeams)
    .values({ slug, name: g.displayName, city: g.cityKey })
    .onConflictDoNothing({ target: dashboardTeams.slug });

  const [team] = await db
    .select({ id: dashboardTeams.id })
    .from(dashboardTeams)
    .where(sql`${dashboardTeams.slug} = ${slug}`)
    .limit(1);
  if (!team) continue;
  createdTeams += 1;

  for (const member of g.members) {
    const inserted = await db
      .insert(dashboardTeamMembers)
      .values({
        teamId: team.id,
        participantId: member.participantId,
        role: member.role,
        isCaptain: member.isCaptain,
      })
      // Un participante pertenece a un solo equipo: si ya está, se respeta.
      .onConflictDoNothing({ target: dashboardTeamMembers.participantId })
      .returning({ participantId: dashboardTeamMembers.participantId });
    addedMembers += inserted.length;
  }
}

console.log(
  `\nListo. ${createdTeams} equipos asegurados, ${addedMembers} integrantes nuevos.\n`,
);
