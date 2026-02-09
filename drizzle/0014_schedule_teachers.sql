-- Step 1: Create schedule_teachers junction table and add teacher_id to sessions
-- After running this migration, run: npx tsx scripts/migrate-schedule-teachers.ts
-- Then run migration 0015 to drop the old teacher_id column

-- Create schedule_teachers junction table
CREATE TABLE IF NOT EXISTS "schedule_teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" uuid
);
--> statement-breakpoint

-- Add teacher_id to class_sessions
ALTER TABLE "class_sessions" ADD COLUMN "teacher_id" uuid;
--> statement-breakpoint

-- Add foreign keys for schedule_teachers
ALTER TABLE "schedule_teachers" ADD CONSTRAINT "schedule_teachers_schedule_id_class_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."class_schedules"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "schedule_teachers" ADD CONSTRAINT "schedule_teachers_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "schedule_teachers" ADD CONSTRAINT "schedule_teachers_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- Add foreign key for class_sessions.teacher_id
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
