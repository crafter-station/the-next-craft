CREATE TABLE "participant_profiles" (
	"participant_id" uuid PRIMARY KEY NOT NULL,
	"participant_number" integer GENERATED ALWAYS AS IDENTITY (sequence name "participant_profiles_participant_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"display_name" text NOT NULL,
	"bio" text,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "badge_participants_share_token_idx";--> statement-breakpoint
ALTER TABLE "participant_profiles" ADD CONSTRAINT "participant_profiles_participant_id_badge_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."badge_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "participant_profiles_number_idx" ON "participant_profiles" USING btree ("participant_number");--> statement-breakpoint
ALTER TABLE "badge_participants" DROP COLUMN "share_token";