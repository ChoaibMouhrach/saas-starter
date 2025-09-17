ALTER TYPE "public"."tokenTypesEnum" ADD VALUE 'change-email' BEFORE 'request-password-reset';--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "token" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "token" DROP DEFAULT;