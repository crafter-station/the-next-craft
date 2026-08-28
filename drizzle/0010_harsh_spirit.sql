CREATE TYPE "public"."dashboard_repo_status" AS ENUM('pending', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "participant_github" (
	"participant_id" uuid PRIMARY KEY NOT NULL,
	"github_user_id" text NOT NULL,
	"login" text NOT NULL,
	"avatar_url" text,
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dashboard_team_members" ADD COLUMN "github_invite_id" text;--> statement-breakpoint
ALTER TABLE "dashboard_team_members" ADD COLUMN "github_invite_state" text;--> statement-breakpoint
ALTER TABLE "dashboard_team_members" ADD COLUMN "github_invited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "dashboard_teams" ADD COLUMN "github_repo_full_name" text;--> statement-breakpoint
ALTER TABLE "dashboard_teams" ADD COLUMN "github_repo_url" text;--> statement-breakpoint
ALTER TABLE "dashboard_teams" ADD COLUMN "github_repo_status" "dashboard_repo_status";--> statement-breakpoint
ALTER TABLE "dashboard_teams" ADD COLUMN "github_repo_error" text;--> statement-breakpoint
ALTER TABLE "dashboard_teams" ADD COLUMN "github_repo_created_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "participant_github" ADD CONSTRAINT "participant_github_participant_id_badge_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."badge_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "participant_github_user_id_idx" ON "participant_github" USING btree ("github_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_teams_github_repo_idx" ON "dashboard_teams" USING btree ("github_repo_full_name");