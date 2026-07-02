CREATE TYPE "public"."class_session_status" AS ENUM('scheduled', 'not_started', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "class_sessions" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "class_sessions" ALTER COLUMN "status" SET DATA TYPE "public"."class_session_status" USING "status"::text::"public"."class_session_status";--> statement-breakpoint
ALTER TABLE "class_sessions" ALTER COLUMN "status" SET DEFAULT 'scheduled';