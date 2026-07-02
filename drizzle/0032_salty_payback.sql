CREATE TYPE "public"."registration_status" AS ENUM('pending', 'reviewed', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "registration_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registration_links_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link_slug" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"nickname" text,
	"gender" text NOT NULL,
	"place_of_birth" text,
	"date_of_birth" date,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"education" text,
	"occupation" text,
	"program_interest" text NOT NULL,
	"notes" text,
	"status" "registration_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_link_slug_registration_links_slug_fk" FOREIGN KEY ("link_slug") REFERENCES "public"."registration_links"("slug") ON DELETE no action ON UPDATE no action;