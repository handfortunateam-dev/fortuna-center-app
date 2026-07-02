-- Step 2: Drop teacher_id from class_schedules
-- IMPORTANT: Only run this AFTER running: npx tsx scripts/migrate-schedule-teachers.ts

ALTER TABLE "class_schedules" DROP CONSTRAINT IF EXISTS "class_schedules_teacher_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "class_schedules" DROP COLUMN IF EXISTS "teacher_id";
