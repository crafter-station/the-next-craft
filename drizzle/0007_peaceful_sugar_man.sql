ALTER TABLE "dashboard_teams" ADD COLUMN "join_code" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_teams_join_code_idx" ON "dashboard_teams" USING btree ("join_code");