CREATE TABLE "participant_partner_codes" (
	"participant_id" uuid NOT NULL,
	"partner_key" text NOT NULL,
	"code" text NOT NULL,
	"assigned_by_email" text,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "participant_partner_codes" ADD CONSTRAINT "participant_partner_codes_participant_id_badge_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."badge_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "participant_partner_codes_participant_partner_idx" ON "participant_partner_codes" USING btree ("participant_id","partner_key");--> statement-breakpoint
CREATE UNIQUE INDEX "participant_partner_codes_partner_code_idx" ON "participant_partner_codes" USING btree ("partner_key","code");