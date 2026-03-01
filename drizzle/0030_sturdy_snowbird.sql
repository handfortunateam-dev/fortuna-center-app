CREATE TYPE "public"."changelog_type" AS ENUM('FEATURE', 'BUG_FIX', 'IMPROVEMENT', 'UPDATE');--> statement-breakpoint
CREATE TABLE "changelogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"type" "changelog_type" NOT NULL,
	"version" varchar(50) NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"author_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "changelogs" ADD CONSTRAINT "changelogs_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;