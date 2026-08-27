import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
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

/** Mesas de mentoría: una por comunidad organizadora, no por persona. */
export const dashboardMentorTables = pgTable(
  "dashboard_mentor_tables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    org: text("org").notNull(),
    role: text("role").notNull(),
    bio: text("bio"),
    expertise: jsonb("expertise")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    teamCapacity: integer("team_capacity").notNull().default(6),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [uniqueIndex("dashboard_mentor_tables_slug_idx").on(table.slug)],
);

export const dashboardTeams = pgTable(
  "dashboard_teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    city: text("city").$type<CityKey>(),
    tableNumber: text("table_number"),
    pitch: text("pitch"),
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    track: dashboardTrack("track"),
    trackConfirmedAt: timestamp("track_confirmed_at", { withTimezone: true }),
    mentorTableId: uuid("mentor_table_id").references(
      () => dashboardMentorTables.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("dashboard_teams_slug_idx").on(table.slug),
    index("dashboard_teams_track_idx").on(table.track),
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
  },
  (table) => [
    // Un participante pertenece a un solo equipo.
    uniqueIndex("dashboard_team_members_participant_idx").on(
      table.participantId,
    ),
    index("dashboard_team_members_team_idx").on(table.teamId),
  ],
);

/** Turnos de 25 minutos dentro del bloque de mentorías (11:00–13:00). */
export const dashboardMentorSlots = pgTable(
  "dashboard_mentor_slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    mentorTableId: uuid("mentor_table_id")
      .notNull()
      .references(() => dashboardMentorTables.id, { onDelete: "cascade" }),
    startsAt: text("starts_at").notNull(), // HH:mm, hora local de sede
    endsAt: text("ends_at").notNull(),
    teamId: uuid("team_id").references(() => dashboardTeams.id, {
      onDelete: "set null",
    }),
    topic: text("topic"),
    bookedAt: timestamp("booked_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("dashboard_mentor_slots_table_start_idx").on(
      table.mentorTableId,
      table.startsAt,
    ),
    // Un equipo no puede tener dos turnos a la misma hora.
    uniqueIndex("dashboard_mentor_slots_team_start_idx")
      .on(table.teamId, table.startsAt)
      .where(sql`${table.teamId} is not null`),
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
  dashboardMentorTables,
  dashboardMentorSlots,
  dashboardPartnerRedemptions,
  dashboardAgendaSaves,
};
