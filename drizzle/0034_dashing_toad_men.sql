ALTER TABLE "class_enrollments" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "level" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "current_level" text;