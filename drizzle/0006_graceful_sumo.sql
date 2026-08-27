CREATE TYPE "public"."dashboard_track" AS ENUM('content-machine', 'out-of-the-box', 'learning-by-shipping');--> statement-breakpoint
CREATE TABLE "dashboard_agenda_saves" (
	"participant_id" uuid NOT NULL,
	"event_time" text NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_mentor_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentor_table_id" uuid NOT NULL,
	"starts_at" text NOT NULL,
	"ends_at" text NOT NULL,
	"team_id" uuid,
	"topic" text,
	"booked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "dashboard_mentor_tables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"org" text NOT NULL,
	"role" text NOT NULL,
	"bio" text,
	"expertise" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"team_capacity" integer DEFAULT 6 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_partner_redemptions" (
	"participant_id" uuid NOT NULL,
	"partner_key" text NOT NULL,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_team_members" (
	"team_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"role" text,
	"is_captain" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"table_number" text,
	"pitch" text,
	"repo_url" text,
	"demo_url" text,
	"track" "dashboard_track",
	"track_confirmed_at" timestamp with time zone,
	"mentor_table_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dashboard_agenda_saves" ADD CONSTRAINT "dashboard_agenda_saves_participant_id_badge_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."badge_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_mentor_slots" ADD CONSTRAINT "dashboard_mentor_slots_mentor_table_id_dashboard_mentor_tables_id_fk" FOREIGN KEY ("mentor_table_id") REFERENCES "public"."dashboard_mentor_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_mentor_slots" ADD CONSTRAINT "dashboard_mentor_slots_team_id_dashboard_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."dashboard_teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_partner_redemptions" ADD CONSTRAINT "dashboard_partner_redemptions_participant_id_badge_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."badge_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_team_members" ADD CONSTRAINT "dashboard_team_members_team_id_dashboard_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."dashboard_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_team_members" ADD CONSTRAINT "dashboard_team_members_participant_id_badge_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."badge_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_teams" ADD CONSTRAINT "dashboard_teams_mentor_table_id_dashboard_mentor_tables_id_fk" FOREIGN KEY ("mentor_table_id") REFERENCES "public"."dashboard_mentor_tables"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_agenda_saves_idx" ON "dashboard_agenda_saves" USING btree ("participant_id","event_time");--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_mentor_slots_table_start_idx" ON "dashboard_mentor_slots" USING btree ("mentor_table_id","starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_mentor_slots_team_start_idx" ON "dashboard_mentor_slots" USING btree ("team_id","starts_at") WHERE "dashboard_mentor_slots"."team_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_mentor_tables_slug_idx" ON "dashboard_mentor_tables" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_partner_redemptions_idx" ON "dashboard_partner_redemptions" USING btree ("participant_id","partner_key");--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_team_members_participant_idx" ON "dashboard_team_members" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "dashboard_team_members_team_idx" ON "dashboard_team_members" USING btree ("team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_teams_slug_idx" ON "dashboard_teams" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "dashboard_teams_track_idx" ON "dashboard_teams" USING btree ("track");