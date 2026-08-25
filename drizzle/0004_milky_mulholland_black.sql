ALTER TABLE "badge_participants" ALTER COLUMN "encrypted_document" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "badge_participants" ADD COLUMN "document_number" text;