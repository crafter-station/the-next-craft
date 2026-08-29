CREATE TABLE "dashboard_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "dashboard_panelists_code_idx";--> statement-breakpoint
ALTER TABLE "dashboard_panelists" DROP COLUMN "access_code";