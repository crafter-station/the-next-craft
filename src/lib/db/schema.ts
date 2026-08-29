import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { CityKey } from "@/lib/cities";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const documentType = pgEnum("badge_document_type", [
  "dni",
  "passport",
  "ce",
]);
export const badgeAttemptStatus = pgEnum("badge_attempt_status", [
  "queued",
  "generating",
  "completed",
  "failed",
  "rejected",
]);

export const badgeParticipants = pgTable(
  "badge_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    lumaGuestId: text("luma_guest_id").notNull(),
    city: text("city").$type<CityKey>(),
    fullName: text("full_name").notNull(),
    vehiclePlate: text("vehicle_plate"),
    documentType: documentType("document_type").notNull(),
    documentNumber: text("document_number"),
    encryptedDocument: text("encrypted_document"),
    termsVersion: text("terms_version").notNull(),
    termsAcceptedAt: timestamp("terms_accepted_at", {
      withTimezone: true,
    }).notNull(),
    shareToken: text("share_token")
      .notNull()
      .default(sql`gen_random_uuid()::text`),
    generationAvailableAt: timestamp("generation_available_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("badge_participants_user_id_idx").on(table.userId),
    uniqueIndex("badge_participants_email_idx").on(table.email),
    uniqueIndex("badge_participants_share_token_idx").on(table.shareToken),
  ],
);

export type ParticipantProfileLink = {
  label: string;
  url: string;
};

export const participantProfiles = pgTable(
  "participant_profiles",
  {
    participantId: uuid("participant_id")
      .primaryKey()
      .references(() => badgeParticipants.id, { onDelete: "cascade" }),
    participantNumber: integer("participant_number")
      .generatedAlwaysAsIdentity({ startWith: 1 })
      .notNull(),
    displayName: text("display_name").notNull(),
    bio: text("bio"),
    links: jsonb("links")
      .$type<ParticipantProfileLink[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("participant_profiles_number_idx").on(table.participantNumber),
  ],
);

export const badgeAttempts = pgTable(
  "badge_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => badgeParticipants.id, { onDelete: "cascade" }),
    status: badgeAttemptStatus("status").notNull().default("queued"),
    sourceImageBase64: text("source_image_base64"),
    sourceImageType: text("source_image_type"),
    pixelArtImageBase64: text("pixel_art_image_base64"),
    badgeImageBase64: text("badge_image_base64"),
    generationRunId: text("generation_run_id"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("badge_attempts_participant_created_idx").on(
      table.participantId,
      table.createdAt,
    ),
    uniqueIndex("badge_attempts_active_participant_idx")
      .on(table.participantId)
      .where(sql`${table.status} in ('queued', 'generating')`),
  ],
);

/* ─────────────────────────────────────────────────────────────
   Dashboard del hacker — estado del día del evento.
   El contenido canónico (agenda, tracks, premios, partners) vive en
   src/messages/{es,en}.json y src/lib/dashboard/content.ts. Aquí solo
   se guarda lo que un equipo decide o consume durante las 12 horas.
   ───────────────────────────────────────────────────────────── */

export const dashboardTrack = pgEnum("dashboard_track", [
  "content-machine",
  "out-of-the-box",
  "learning-by-shipping",
]);

/**
 * Estado del repo que la organización le entrega al equipo. `null` = todavía no
 * se pidió. `pending` es además el cerrojo: se escribe con un UPDATE
 * condicional para que dos clics del capitán no creen dos repos.
 */
export const dashboardRepoStatus = pgEnum("dashboard_repo_status", [
  "pending",
  "ready",
  "failed",
]);

export const dashboardTeams = pgTable(
  "dashboard_teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    /**
     * Código corto que se comparte para entrar al equipo. Los equipos se forman
     * en el kickoff, en persona: es más rápido dictar seis caracteres que
     * buscar a alguien en una lista.
     */
    joinCode: text("join_code").notNull(),
    city: text("city").$type<CityKey>(),
    tableNumber: text("table_number"),
    pitch: text("pitch"),
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    track: dashboardTrack("track"),
    trackConfirmedAt: timestamp("track_confirmed_at", { withTimezone: true }),
    /**
     * Pasó la fase de sede. Lo marca el staff desde el tablero de calificación,
     * mirando el ranking normalizado: el corte es una decisión del comité, no
     * un umbral automático, porque el número de finalistas por sede depende de
     * cuántos equipos hubo allí.
     */
    finalistAt: timestamp("finalist_at", { withTimezone: true }),
    /**
     * Repo generado desde el template de la organización: `org/nombre`. Es
     * distinto de `repoUrl`, que el equipo puede sobreescribir a mano si al
     * final trabaja en otro lado.
     */
    githubRepoFullName: text("github_repo_full_name"),
    githubRepoUrl: text("github_repo_url"),
    githubRepoStatus: dashboardRepoStatus("github_repo_status"),
    githubRepoError: text("github_repo_error"),
    githubRepoCreatedAt: timestamp("github_repo_created_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("dashboard_teams_slug_idx").on(table.slug),
    uniqueIndex("dashboard_teams_join_code_idx").on(table.joinCode),
    index("dashboard_teams_track_idx").on(table.track),
    uniqueIndex("dashboard_teams_github_repo_idx").on(table.githubRepoFullName),
  ],
);

export const dashboardTeamMembers = pgTable(
  "dashboard_team_members",
  {
    teamId: uuid("team_id")
      .notNull()
      .references(() => dashboardTeams.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => badgeParticipants.id, { onDelete: "cascade" }),
    role: text("role"),
    isCaptain: boolean("is_captain").notNull().default(false),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    /**
     * Invitación de colaborador al repo del equipo. GitHub la manda por correo
     * y hay que aceptarla: `pending` hasta que desaparece de la lista de
     * invitaciones del repo. El id sirve para revocarla si se va del equipo.
     */
    githubInviteId: text("github_invite_id"),
    githubInviteState: text("github_invite_state").$type<GithubInviteState>(),
    githubInvitedAt: timestamp("github_invited_at", { withTimezone: true }),
  },
  (table) => [
    // Un participante pertenece a un solo equipo.
    uniqueIndex("dashboard_team_members_participant_idx").on(
      table.participantId,
    ),
    index("dashboard_team_members_team_idx").on(table.teamId),
  ],
);

export type GithubInviteState = "pending" | "accepted" | "failed";

/**
 * La cuenta de GitHub que el hacker vinculó por OAuth. El `login` cambia si
 * alguien se renombra en GitHub, así que la clave dura es `githubUserId` (el id
 * numérico) y el login se refresca en cada sincronización.
 *
 * Vive aparte de `account` (better-auth) porque ahí solo queda el id numérico y
 * lo que necesitamos para invitar es el login.
 */
export const participantGithub = pgTable(
  "participant_github",
  {
    participantId: uuid("participant_id")
      .primaryKey()
      .references(() => badgeParticipants.id, { onDelete: "cascade" }),
    githubUserId: text("github_user_id").notNull(),
    login: text("login").notNull(),
    avatarUrl: text("avatar_url"),
    linkedAt: timestamp("linked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Una cuenta de GitHub no puede estar en dos acreditaciones.
    uniqueIndex("participant_github_user_id_idx").on(table.githubUserId),
  ],
);

/**
 * Código real de un partner asignado a un participante (subida masiva desde
 * /admin/perks). Sustituye el placeholder determinista del dashboard.
 */
export const participantPartnerCodes = pgTable(
  "participant_partner_codes",
  {
    participantId: uuid("participant_id")
      .notNull()
      .references(() => badgeParticipants.id, { onDelete: "cascade" }),
    partnerKey: text("partner_key").notNull(),
    code: text("code").notNull(),
    assignedByEmail: text("assigned_by_email"),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("participant_partner_codes_participant_partner_idx").on(
      table.participantId,
      table.partnerKey,
    ),
    uniqueIndex("participant_partner_codes_partner_code_idx").on(
      table.partnerKey,
      table.code,
    ),
  ],
);

/** Inventario de códigos que se asignan solo cuando un participante los pide. */
export const partnerCodePool = pgTable(
  "partner_code_pool",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    partnerKey: text("partner_key").notNull(),
    code: text("code").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("partner_code_pool_partner_code_idx").on(
      table.partnerKey,
      table.code,
    ),
  ],
);

/** Canje de créditos de partners. La clave del partner vive en content.ts. */
export const dashboardPartnerRedemptions = pgTable(
  "dashboard_partner_redemptions",
  {
    participantId: uuid("participant_id")
      .notNull()
      .references(() => badgeParticipants.id, { onDelete: "cascade" }),
    partnerKey: text("partner_key").notNull(),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("dashboard_partner_redemptions_idx").on(
      table.participantId,
      table.partnerKey,
    ),
  ],
);

/** «Mi agenda»: bloques guardados, identificados por su hora canónica. */
export const dashboardAgendaSaves = pgTable(
  "dashboard_agenda_saves",
  {
    participantId: uuid("participant_id")
      .notNull()
      .references(() => badgeParticipants.id, { onDelete: "cascade" }),
    eventTime: text("event_time").notNull(), // HH:mm, coincide con schedule.events
    savedAt: timestamp("saved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("dashboard_agenda_saves_idx").on(
      table.participantId,
      table.eventTime,
    ),
  ],
);

/**
 * Check-in de sede: lo marca el staff en la puerta, no el participante.
 * Se guarda quién lo marcó porque en cinco sedes simultáneas hace falta poder
 * preguntar después.
 */
export const dashboardCheckins = pgTable("dashboard_checkins", {
  participantId: uuid("participant_id")
    .primaryKey()
    .references(() => badgeParticipants.id, { onDelete: "cascade" }),
  arrivedAt: timestamp("arrived_at", { withTimezone: true }),
  arrivedByEmail: text("arrived_by_email"),
  merchDeliveredAt: timestamp("merch_delivered_at", { withTimezone: true }),
  merchByEmail: text("merch_by_email"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Las dos capas de evaluación. No son dos nombres para lo mismo:
 *
 * - `mentor` califica en su sede, en persona, durante la fase 1. Su alcance son
 *   los equipos de esa sede y de ahí salen los finalistas.
 * - `judge` califica en línea, en la fase 2, a los finalistas de las cinco
 *   sedes a la vez.
 *
 * La distinción importa para el cálculo: dentro de una sede los puntajes se
 * normalizan entre mentores, pero los de sedes distintas NO se comparan entre
 * sí —no comparten ni mentores ni equipos, así que no hay nada que los ponga en
 * la misma escala—. Por eso la fase 2 es un panel único sobre todos los
 * finalistas: al ver todos a todos, la comparación vuelve a ser válida.
 */
export const dashboardPanelRole = pgEnum("dashboard_panel_role", [
  "mentor",
  "judge",
]);

/**
 * Quién puede calificar. Es una lista blanca de correos que mantiene el staff:
 * mentores y jurados no salen de Luma (no son participantes) ni del dominio de
 * la organización, así que necesitan su propia puerta para recibir el OTP.
 *
 * `userId` se rellena solo, la primera vez que la persona inicia sesión.
 */
export const dashboardPanelists = pgTable(
  "dashboard_panelists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    role: dashboardPanelRole("role").notNull(),
    /** Sede que le toca al mentor. Los jurados de fase 2 no llevan sede. */
    city: text("city").$type<CityKey>(),
    /**
     * Con lo que entra. Es una credencial al portador: quien lo tenga es este
     * panelista, sin correo ni contraseña de por medio.
     *
     * Se eligió así porque el correo fallaba justo donde más duele. Un mentor
     * de pie en una sala con ruido no siempre tiene su bandeja a mano, y si
     * escribía una dirección distinta a la que el staff dio de alta no pasaba
     * nada —ni error ni código—, porque el OTP solo se envía a correos
     * conocidos. Con un código, el staff se lo dicta y entra.
     *
     * Se guarda en claro, no hasheado, y es deliberado: el staff necesita
     * poder releérselo a quien pierda el papel, que es lo que de verdad pasa
     * en un evento. El intercambio se sostiene porque el código vive un día y
     * solo abre la calificación; para una credencial permanente no valdría.
     *
     * El `default` no es el camino normal —la app siempre escribe el suyo, con
     * más entropía— sino una red: las migraciones se aplican a mano y por
     * separado del despliegue, así que existe una ventana en la que el código
     * viejo puede insertar un panelista sin saber de esta columna. Con default
     * esa fila nace utilizable en vez de romper el alta. `random()` es volátil,
     * de modo que Postgres lo evalúa por fila y el índice único aguanta.
     */
    accessCode: text("access_code")
      .notNull()
      .default(
        sql`translate(upper(substr(md5(random()::text), 1, 8)), '01', 'XY')`,
      ),
    invitedByEmail: text("invited_by_email"),
    /** Baja sin borrar: los puntajes que ya emitió siguen siendo válidos. */
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("dashboard_panelists_email_idx").on(table.email),
    uniqueIndex("dashboard_panelists_code_idx").on(table.accessCode),
    index("dashboard_panelists_role_city_idx").on(table.role, table.city),
  ],
);

export const dashboardScorePhase = pgEnum("dashboard_score_phase", [
  "sede",
  "final",
]);

/**
 * Un puntaje = un panelista, un equipo, una fase. Los cinco criterios van en
 * columnas propias y no en un jsonb: la rúbrica está cerrada y publicada, y
 * tenerlos como columnas deja que el promedio y la desviación por panelista se
 * calculen en SQL.
 *
 * Las notas son enteros 0–5 tal cual los pone el panelista. Los pesos
 * (30/25/20/15/10) se aplican al leer, nunca al guardar: si algo se recalcula
 * después, se recalcula sobre el dato crudo.
 *
 * `submittedAt` nulo = borrador. Un borrador no entra en ningún cálculo, porque
 * una fila a medias sesga la media del panelista.
 */
export const dashboardScores = pgTable(
  "dashboard_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    panelistId: uuid("panelist_id")
      .notNull()
      .references(() => dashboardPanelists.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => dashboardTeams.id, { onDelete: "cascade" }),
    phase: dashboardScorePhase("phase").notNull(),
    /*
      0–5 en pasos de media. `real` y no `integer` porque la hoja de evaluación
      oficial valida `decimal between 0 and 5` y su fila de ejemplo usa 4.5: un
      jurado que venga de la hoja tiene que poder transcribir lo que puso.

      Los medios puntos además matan casi todos los empates, que con cinco
      criterios enteros salían a cada rato. Medio punto es exactamente
      representable en binario, así que `real` no introduce error.
    */
    demo: real("demo"),
    usage: real("usage"),
    craft: real("craft"),
    ambition: real("ambition"),
    pitch: real("pitch"),
    /** Una frase de lo que se vio, por criterio. Es el feedback del equipo. */
    evidence: jsonb("evidence").$type<Record<string, string>>(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("dashboard_scores_panelist_team_phase_idx").on(
      table.panelistId,
      table.teamId,
      table.phase,
    ),
    index("dashboard_scores_phase_team_idx").on(table.phase, table.teamId),
  ],
);

export const schema = {
  user,
  session,
  account,
  verification,
  badgeParticipants,
  participantProfiles,
  badgeAttempts,
  dashboardTeams,
  dashboardTeamMembers,
  participantGithub,
  participantPartnerCodes,
  dashboardPartnerRedemptions,
  dashboardAgendaSaves,
  dashboardCheckins,
  dashboardPanelists,
  dashboardScores,
};
