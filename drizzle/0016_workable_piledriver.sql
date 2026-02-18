CREATE TABLE "schedule_teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" uuid
);
--> statement-breakpoint
ALTER TABLE "post_likes" RENAME COLUMN "user_id" TO "visitor_id";--> statement-breakpoint
ALTER TABLE "class_schedules" DROP CONSTRAINT "class_schedules_teacher_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "class_sessions" ADD COLUMN "teacher_id" uuid;--> statement-breakpoint
ALTER TABLE "schedule_teachers" ADD CONSTRAINT "schedule_teachers_schedule_id_class_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."class_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_teachers" ADD CONSTRAINT "schedule_teachers_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_teachers" ADD CONSTRAINT "schedule_teachers_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_schedules" DROP COLUMN "teacher_id";