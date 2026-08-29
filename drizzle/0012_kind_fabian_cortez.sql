CREATE TYPE "public"."dashboard_panel_role" AS ENUM('mentor', 'judge');--> statement-breakpoint
CREATE TYPE "public"."dashboard_score_phase" AS ENUM('sede', 'final');--> statement-breakpoint
CREATE TABLE "dashboard_panelists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"role" "dashboard_panel_role" NOT NULL,
	"city" text,
	"user_id" text,
	"invited_by_email" text,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"panelist_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"phase" "dashboard_score_phase" NOT NULL,
	"demo" real,
	"usage" real,
	"craft" real,
	"ambition" real,
	"pitch" real,
	"evidence" jsonb,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dashboard_teams" ADD COLUMN "finalist_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "dashboard_panelists" ADD CONSTRAINT "dashboard_panelists_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_scores" ADD CONSTRAINT "dashboard_scores_panelist_id_dashboard_panelists_id_fk" FOREIGN KEY ("panelist_id") REFERENCES "public"."dashboard_panelists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_scores" ADD CONSTRAINT "dashboard_scores_team_id_dashboard_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."dashboard_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_panelists_email_idx" ON "dashboard_panelists" USING btree ("email");--> statement-breakpoint
CREATE INDEX "dashboard_panelists_role_city_idx" ON "dashboard_panelists" USING btree ("role","city");--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_scores_panelist_team_phase_idx" ON "dashboard_scores" USING btree ("panelist_id","team_id","phase");--> statement-breakpoint
CREATE INDEX "dashboard_scores_phase_team_idx" ON "dashboard_scores" USING btree ("phase","team_id");