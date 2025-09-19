ALTER TABLE "sessions" ADD COLUMN "expiresAt" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "expiresAt" timestamp NOT NULL;